/**
 * Sistema de Fila de Eventos usando IndexedDB
 * Armazena eventos localmente e permite retry quando offline
 */

import type { TrackingEvent } from '../types/events';

const DB_NAME = 'tracking_queue_db';
const DB_VERSION = 1;
const STORE_NAME = 'events';
const MAX_AGE_DAYS = 7; // Remove eventos mais antigos que 7 dias

interface QueuedEvent {
  id: string;
  event: TrackingEvent;
  attempts: number;
  lastAttempt: number;
  createdAt: number;
}

/**
 * Classe para gerenciar a fila de eventos
 */
export class EventQueue {
  private db: IDBDatabase | null = null;
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.initDB();
  }

  /**
   * Inicializa o IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.cleanOldEvents(); // Limpa eventos antigos em background
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Cria object store se não existir
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('attempts', 'attempts', { unique: false });
        }
      };
    });
  }

  /**
   * Adiciona um evento à fila
   */
  async enqueue(event: TrackingEvent): Promise<void> {
    await this.initialized;

    if (!this.db) {
      console.error('❌ IndexedDB não inicializado');
      return;
    }

    const queuedEvent: QueuedEvent = {
      id: event.id,
      event,
      attempts: 0,
      lastAttempt: 0,
      createdAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(queuedEvent);

      request.onsuccess = () => {
        if (typeof window !== 'undefined' && (window as any).__TRACKING_DEBUG__) {
          console.log('✅ Evento adicionado à fila:', event.name);
        }
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao adicionar evento à fila:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Remove um evento da fila (após envio bem-sucedido)
   */
  async dequeue(eventId: string): Promise<void> {
    await this.initialized;

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(eventId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao remover evento da fila:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Obtém todos os eventos pendentes
   */
  async getAll(): Promise<QueuedEvent[]> {
    await this.initialized;

    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('❌ Erro ao obter eventos da fila:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Obtém eventos prontos para retry (com backoff exponencial)
   */
  async getReadyForRetry(maxRetries: number = 5): Promise<QueuedEvent[]> {
    const allEvents = await this.getAll();
    const now = Date.now();

    return allEvents.filter((queuedEvent) => {
      // Não tenta novamente se excedeu o número máximo de tentativas
      if (queuedEvent.attempts >= maxRetries) {
        return false;
      }

      // Calcula delay baseado no número de tentativas (backoff exponencial)
      const delay = Math.min(1000 * Math.pow(2, queuedEvent.attempts), 30000); // Max 30s
      const nextAttemptTime = queuedEvent.lastAttempt + delay;

      return now >= nextAttemptTime;
    });
  }

  /**
   * Incrementa o contador de tentativas de um evento
   */
  async incrementAttempts(eventId: string): Promise<void> {
    await this.initialized;

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(eventId);

      getRequest.onsuccess = () => {
        const queuedEvent = getRequest.result;
        if (queuedEvent) {
          queuedEvent.attempts += 1;
          queuedEvent.lastAttempt = Date.now();

          const putRequest = store.put(queuedEvent);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Limpa eventos antigos (mais de MAX_AGE_DAYS)
   */
  private async cleanOldEvents(): Promise<void> {
    await this.initialized;

    if (!this.db) {
      return;
    }

    const cutoffTime = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpa toda a fila (útil para testes ou reset)
   */
  async clear(): Promise<void> {
    await this.initialized;

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém o tamanho da fila
   */
  async size(): Promise<number> {
    const allEvents = await this.getAll();
    return allEvents.length;
  }
}

// Instância singleton
export const eventQueue = new EventQueue();

