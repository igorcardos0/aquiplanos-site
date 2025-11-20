<?php
/**
 * API Endpoint para Receber Eventos de Tracking
 * 
 * Endpoint: POST /backend/api/events.php
 * 
 * Headers:
 * - Content-Type: application/json
 * - X-API-Key: {api_key}
 * 
 * Body:
 * {
 *   "events": [...],
 *   "api_key": "string"
 * }
 */

// Configurações
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');

// Responde OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Apenas aceita POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use POST.',
    ]);
    exit;
}

// Inclui configuração do banco de dados
require_once __DIR__ . '/../config/database.php';

/**
 * Valida API Key
 */
function validateApiKey($apiKey, $db) {
    $stmt = $db->prepare("SELECT id, domain FROM api_keys WHERE api_key = ? AND active = 1");
    $stmt->execute([$apiKey]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
}

/**
 * Valida origem (CORS)
 */
function validateOrigin($allowedDomains) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (empty($allowedDomains)) {
        return true; // Se não houver domínios configurados, permite todos
    }
    
    foreach ($allowedDomains as $domain) {
        if (strpos($origin, $domain) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Rate limiting simples (por IP)
 */
function checkRateLimit($ip, $db) {
    $limit = 100; // eventos por minuto
    $window = 60; // segundos
    
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM events 
        WHERE ip_address = ? 
        AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");
    $stmt->execute([$ip, $window]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return ($result['count'] ?? 0) < $limit;
}

/**
 * Insere evento no banco
 */
function insertEvent($event, $apiKeyInfo, $db) {
    $stmt = $db->prepare("
        INSERT INTO events (
            id, event_type, event_name, category, label, value,
            properties, page_url, page_path, page_title, referrer,
            session_id, user_agent, ip_address, metadata, created_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, NOW()
        )
    ");
    
    $properties = json_encode($event['properties'] ?? []);
    $metadata = json_encode($event['metadata'] ?? []);
    
    return $stmt->execute([
        $event['id'] ?? uniqid('evt_', true),
        $event['type'] ?? 'unknown',
        $event['name'] ?? 'unknown',
        $event['category'] ?? null,
        $event['label'] ?? null,
        $event['value'] ?? null,
        $properties,
        $event['page']['url'] ?? '',
        $event['page']['path'] ?? '',
        $event['page']['title'] ?? '',
        $event['page']['referrer'] ?? null,
        $event['user']['session_id'] ?? null,
        $event['user']['user_agent'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? null,
        $metadata,
    ]);
}

/**
 * Envia evento para integrações externas (webhook, etc)
 */
function sendToIntegrations($event, $apiKeyInfo) {
    // Aqui você pode adicionar lógica para enviar para webhooks,
    // sistemas externos, etc.
    
    // Exemplo: Enviar para webhook configurado
    // if (!empty($apiKeyInfo['webhook_url'])) {
    //     file_get_contents($apiKeyInfo['webhook_url'], false, stream_context_create([
    //         'http' => [
    //             'method' => 'POST',
    //             'header' => 'Content-Type: application/json',
    //             'content' => json_encode($event),
    //         ],
    //     ]));
    // }
}

// ============================================
// PROCESSAMENTO PRINCIPAL
// ============================================

try {
    // Obtém dados do request
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    // Valida estrutura básica
    if (!isset($data['events']) || !is_array($data['events'])) {
        throw new Exception('Campo "events" é obrigatório e deve ser um array');
    }
    
    // Obtém API key
    $apiKey = $data['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
    
    if (empty($apiKey)) {
        throw new Exception('API key não fornecida');
    }
    
    // Valida API key
    $apiKeyInfo = validateApiKey($apiKey, $db);
    
    if (!$apiKeyInfo) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'API key inválida ou inativa',
        ]);
        exit;
    }
    
    // Valida origem (se configurado)
    $allowedDomains = explode(',', $apiKeyInfo['domain'] ?? '');
    if (!empty($allowedDomains[0]) && !validateOrigin($allowedDomains)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Origem não permitida',
        ]);
        exit;
    }
    
    // Rate limiting
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (!checkRateLimit($ip, $db)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Rate limit excedido',
        ]);
        exit;
    }
    
    // Processa eventos
    $processed = 0;
    $failed = 0;
    $errors = [];
    
    foreach ($data['events'] as $event) {
        try {
            // Valida evento básico
            if (empty($event['id']) || empty($event['type']) || empty($event['name'])) {
                throw new Exception('Evento inválido: campos obrigatórios faltando');
            }
            
            // Insere no banco
            if (insertEvent($event, $apiKeyInfo, $db)) {
                $processed++;
                
                // Envia para integrações
                sendToIntegrations($event, $apiKeyInfo);
            } else {
                throw new Exception('Erro ao inserir evento no banco');
            }
        } catch (Exception $e) {
            $failed++;
            $errors[] = $e->getMessage();
        }
    }
    
    // Resposta de sucesso
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'processed' => $processed,
        'failed' => $failed,
        'errors' => $errors,
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}

