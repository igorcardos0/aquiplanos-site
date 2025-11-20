# 📚 Guia Completo - Aqui Planos

**Projeto:** Landing Page para Cotação de Planos de Saúde Empresariais  
**Framework:** Next.js 16.0.0 (React 18.3.1)  
**Linguagem:** TypeScript  
**Deploy:** Build Estático (cPanel/hosting tradicional)

---

## 📋 Índice

1. [Iniciando o Projeto](#1-iniciando-o-projeto)
2. [Estrutura do Projeto](#2-estrutura-do-projeto)
3. [Configuração e Variáveis](#3-configuração-e-variáveis)
4. [Desenvolvimento Local](#4-desenvolvimento-local)
5. [Componentes do Projeto](#5-componentes-do-projeto)
6. [Formulário de Cotação](#6-formulário-de-cotação)
7. [Backend (PHP)](#7-backend-php)
8. [Sistema de Tracking](#8-sistema-de-tracking)
9. [Build e Deploy](#9-build-e-deploy)
10. [Alterações Comuns](#10-alterações-comuns)
11. [Testes e Debugging](#11-testes-e-debugging)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Iniciando o Projeto

### 1.1 Pré-requisitos

- Node.js 18+ instalado
- npm ou pnpm instalado
- Git (opcional, para controle de versão)

### 1.2 Instalação

```bash
# 1. Entre na pasta do projeto
cd /home/alpla/projetos/aquiplanos

# 2. Instale as dependências
npm install
# ou
pnpm install

# 3. Crie o arquivo .env.local (veja seção 3.2)
```

### 1.3 Scripts Disponíveis

```bash
# Desenvolvimento local (localhost:3000)
npm run dev

# Build para produção (gera pasta /out)
npm run build

# Build estático (alias)
npm run build:static

# Build sem export (para servidor Next.js)
npm run build:server

# Limpar cache e pastas temporárias
npm run clean

# Verificar erros de código
npm run lint
```

---

## 2. Estrutura do Projeto

```
aquiplanos/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Layout principal (head, providers)
│   ├── page.tsx               # Página inicial (/)
│   ├── obrigado/
│   │   └── page.tsx           # Página de agradecimento (/obrigado)
│   └── globals.css            # Estilos globais
│
├── components/                 # Componentes React
│   ├── header.tsx             # Cabeçalho com navegação
│   ├── hero.tsx               # Seção hero (banner principal)
│   ├── benefits.tsx           # Seção de benefícios
│   ├── how-it-works.tsx       # Como funciona
│   ├── cases.tsx              # Cases de sucesso
│   ├── social-proof.tsx       # Prova social
│   ├── conversion-form.tsx    # Formulário de cotação
│   ├── faq.tsx                # Perguntas frequentes
│   └── footer.tsx             # Rodapé
│
├── lib/                       # Utilitários e lógica
│   ├── analytics.ts           # Funções de tracking (Meta, GA)
│   ├── whatsapp-handler.ts    # Handler para links WhatsApp
│   └── tracking/              # Sistema de tracking avançado
│
├── providers/                 # Context Providers
│   ├── AnalyticsProvider.tsx  # Provider de analytics (Meta Pixel, GA4)
│   └── TrackingProvider.tsx   # Provider de tracking avançado
│
├── public/                    # Arquivos estáticos
│   ├── images/                # Imagens do site
│   └── tracking/              # Scripts de tracking
│
├── backend/                   # Backend PHP (opcional)
│   ├── api/                   # Endpoints PHP
│   └── config/                # Configurações
│
├── send_lead.php              # Script PHP para envio de emails (RAIZ)
├── phpmailer/                 # Biblioteca PHPMailer (RAIZ)
│   └── src/                   # Arquivos do PHPMailer
│
├── next.config.mjs            # Configuração do Next.js
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
└── tailwind.config.js         # Configuração Tailwind CSS
```

---

## 3. Configuração e Variáveis

### 3.1 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Meta Pixel (Facebook)
NEXT_PUBLIC_FB_PIXEL_ID=1176726867445215

# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-T93R6XBSL3

# Google Tag Manager (opcional)
NEXT_PUBLIC_GTM_ID=GTM-NZ34Z9RQ

# Facebook Access Token (opcional)
NEXT_PUBLIC_FB_ACCESS_TOKEN=seu-token-aqui

# Tracking API (opcional - para sistema avançado)
NEXT_PUBLIC_TRACKING_API_URL=/backend/api/events.php
NEXT_PUBLIC_TRACKING_API_KEY=sua-api-key
NEXT_PUBLIC_TRACKING_ENABLED=true
NEXT_PUBLIC_TRACKING_DEBUG=false
```

**⚠️ IMPORTANTE:** O arquivo `.env.local` não deve ser commitado no Git (já está no `.gitignore`).

### 3.2 Configuração do Send Lead (PHP)

No arquivo `send_lead.php` (linha 69-73), configure:

```php
define('EMAIL_USER', 'leadsaquiplanos@aquiplanos.com.br');
define('EMAIL_PASS', 'sua-senha-do-cpanel'); // Senha do email no cPanel
define('SMTP_HOST', 'mail.aquiplanos.com.br');
define('SMTP_PORT', 465); // ou 587
define('SMTP_SECURE', 'ssl'); // ou 'tls'
```

**Onde alterar:** Linha 70 do arquivo `send_lead.php`

---

## 4. Desenvolvimento Local

### 4.1 Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor inicia em `http://localhost:3000`

### 4.2 Hot Reload

O Next.js tem hot reload automático:
- Alterações em componentes → Página recarrega automaticamente
- Alterações em CSS → Aplicadas instantaneamente
- Erros de TypeScript → Aparecem no terminal e no navegador

### 4.3 Console do Navegador

Pressione `F12` ou `Ctrl+Shift+I` para abrir:
- **Console:** Ver logs e erros
- **Network:** Ver requisições HTTP
- **Elements:** Inspecionar HTML/CSS

### 4.4 Erros Comuns ao Iniciar

**Erro:** "Cannot find module"
```bash
# Solução: Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

**Erro:** "Port 3000 is already in use"
```bash
# Solução: Usar outra porta
PORT=3001 npm run dev
```

**Erro:** "Hydration mismatch"
- Verifique se há uso de `window` ou `document` antes da hidratação
- Use `useEffect` para código que depende do navegador

---

## 5. Componentes do Projeto

### 5.1 Header (`components/header.tsx`)

**O que faz:** Cabeçalho com navegação e menu mobile

**Como alterar:**
- Logo: Procure por `<img>` ou `<Image>` no código
- Links do menu: Procure por `<a>` ou `<Link>`
- Botão CTA: Procure por "Solicitar Cotação"

**Para que serve:**
- Navegação principal
- Menu mobile responsivo
- Botão de chamada para ação

### 5.2 Hero (`components/hero.tsx`)

**O que faz:** Banner principal da página inicial

**Como alterar:**
- Título: Procure por `<h1>` ou variáveis de título
- Subtítulo: Procure por `<p>` ou descrições
- Botões: Procure por links de WhatsApp ou formulário
- Imagem de fundo: Procure por `background-image` ou `<Image>`

**Para que serve:**
- Primeira impressão do visitante
- CTAs principais (WhatsApp e Formulário)
- Comunicação da proposta de valor

### 5.3 Conversion Form (`components/conversion-form.tsx`)

**O que faz:** Formulário de cotação que envia dados para o PHP

**Como alterar campos:**
1. Abra `components/conversion-form.tsx`
2. Procure por `formData` (linha ~11)
3. Adicione/remova campos no objeto:
```typescript
const [formData, setFormData] = useState({
  nome: "",
  empresa: "",
  // Adicione seu campo aqui
  novoCampo: "",
});
```
4. Adicione o input no JSX (procure pela seção `<form>`)

**Endpoint PHP:** `https://app.aquiplanos.com.br/send_lead.php` (linha 70)

**Para que serve:**
- Coleta dados de contato
- Envia para o servidor PHP
- Redireciona para página de obrigado

### 5.4 Outros Componentes

**Benefits** (`components/benefits.tsx`)
- Seção de benefícios
- Alterar: Procure por lista de benefícios no código

**FAQ** (`components/faq.tsx`)
- Perguntas frequentes
- Alterar: Procure por array de perguntas/respostas

**Footer** (`components/footer.tsx`)
- Rodapé com links e contatos
- Alterar: Procure por links sociais e informações

---

## 6. Formulário de Cotação

### 6.1 Como Funciona

1. Usuário preenche o formulário
2. Clica em "Receber cotação agora"
3. Dados são enviados para `send_lead.php` via POST (JSON)
4. PHP valida e envia email
5. Redireciona para `/obrigado`

### 6.2 Alterar Campos do Formulário

**Adicionar novo campo:**

1. Abra `components/conversion-form.tsx`

2. Adicione no estado (linha ~11):
```typescript
const [formData, setFormData] = useState({
  nome: "",
  empresa: "",
  novoCampo: "", // ← ADICIONE AQUI
});
```

3. Adicione o input no formulário (procure por `<form>`):
```tsx
<input
  type="text"
  name="novoCampo"
  placeholder="Novo Campo"
  value={formData.novoCampo}
  onChange={handleChange}
  className="..."
/>
```

4. Atualize o `send_lead.php` para receber o novo campo (linha ~84)

### 6.3 Alterar Email Destinatário

No arquivo `send_lead.php`, linha 198:

```php
$mail->addAddress('igor.souza@v4company.com'); // ← ALTERE AQUI
```

### 6.4 Alterar Template do Email

No arquivo `send_lead.php`, linhas 119-150, procure por `$body`:

```php
$body = "
    <html>
    <head>
        <style>
            /* Alterar estilos aqui */
        </style>
    </head>
    <body>
        <h2>Nova Cotação...</h2>
        <table>
            <!-- Alterar conteúdo do email aqui -->
        </table>
    </body>
    </html>
";
```

---

## 7. Backend (PHP)

### 7.1 Arquivo send_lead.php

**Localização:** Raiz do projeto (`/send_lead.php`)

**O que faz:**
- Recebe dados do formulário (POST JSON)
- Valida campos obrigatórios
- Envia email usando PHPMailer
- Retorna resposta JSON

**Estrutura:**
```
1. Configurações CORS (linhas 10-20)
2. Inclusão PHPMailer (linhas 28-55)
3. Configuração SMTP (linhas 62-73)
4. Validação de dados (linhas 82-108)
5. Montagem do email HTML (linhas 119-150)
6. Envio do email (linhas 155-238)
7. Resposta JSON (linhas 240-336)
```

### 7.2 Configurar Email SMTP

**No cPanel:**
1. Email Accounts → `leadsaquiplanos@aquiplanos.com.br`
2. Configurar cliente de e-mail
3. Anotar: Host SMTP, Porta, Username

**No código:**
Edite `send_lead.php` linha 70:
```php
define('EMAIL_PASS', 'sua-senha-aqui');
```

### 7.3 Upload para Servidor

**Arquivos necessários no servidor:**
```
app.aquiplanos.com.br/
├── send_lead.php
└── phpmailer/
    └── src/
        ├── Exception.php
        ├── PHPMailer.php
        └── SMTP.php
```

**Como fazer upload:**
1. cPanel → File Manager
2. Navegue até `app.aquiplanos.com.br/`
3. Faça upload dos arquivos
4. Verifique permissões (644 para PHP, 755 para pastas)

### 7.4 Testar PHP

Acesse no navegador:
```
https://app.aquiplanos.com.br/send_lead.php
```

**Resultado esperado:**
- JSON: `{"success": false, "message": "Método não permitido."}`
- ✅ Se aparecer isso: PHP está funcionando!

---

## 8. Sistema de Tracking

### 8.1 Analytics Provider

**Arquivo:** `providers/AnalyticsProvider.tsx`

**O que faz:**
- Inicializa Meta Pixel (Facebook)
- Inicializa Google Analytics 4
- Rastreia PageView automático
- Timers de engajamento (10s, 30s)

**Como usar manualmente:**

Em qualquer componente:
```typescript
import { trackConversion } from '@/lib/analytics';

// Em um botão
<button onClick={() => {
  trackConversion('Click', {
    category: 'CTA',
    label: 'Botão Benefícios'
  });
}}>
  Clique aqui
</button>
```

### 8.2 Alterar IDs de Tracking

**Meta Pixel:**
- Arquivo: `.env.local`
- Variável: `NEXT_PUBLIC_FB_PIXEL_ID`

**Google Analytics:**
- Arquivo: `.env.local`
- Variável: `NEXT_PUBLIC_GA_ID`

**Atualizar:**
1. Altere no `.env.local`
2. Reinicie o servidor (`npm run dev`)

### 8.3 Desabilitar em Localhost

O Meta Pixel já está configurado para não carregar em localhost (automático).

---

## 9. Build e Deploy

### 9.1 Build para Produção

```bash
npm run build
```

**O que acontece:**
- Compila TypeScript
- Otimiza imagens
- Gera pasta `/out` com arquivos estáticos
- Pronto para upload no cPanel

### 9.2 Estrutura do Build

```
out/
├── index.html          # Página inicial
├── obrigado.html       # Página de agradecimento
├── _next/              # Assets do Next.js
│   ├── static/         # JS, CSS compilados
│   └── ...
├── images/             # Imagens otimizadas
└── ...                 # Outros arquivos
```

### 9.3 Deploy no cPanel

**Método 1: Upload Manual**
1. cPanel → File Manager
2. Navegue até `app.aquiplanos.com.br/`
3. Delete conteúdo antigo (exceto `send_lead.php` e `phpmailer/`)
4. Faça upload do conteúdo da pasta `/out`
5. Extraia se necessário

**Método 2: FTP**
1. Use cliente FTP (FileZilla, WinSCP)
2. Conecte no servidor
3. Faça upload da pasta `/out` para `public_html/app.aquiplanos.com.br/`

**Arquivos que NÃO devem ser sobrescritos:**
- `send_lead.php` (deve permanecer)
- `phpmailer/` (deve permanecer)

### 9.4 Verificar Deploy

1. Acesse: `https://app.aquiplanos.com.br/`
2. Verifique se carrega corretamente
3. Teste o formulário
4. Verifique console do navegador (F12) para erros

---

## 10. Alterações Comuns

### 10.1 Alterar Textos

**Na página inicial:**
- Abra `components/hero.tsx` → Procure por textos
- Abra `components/benefits.tsx` → Procure por lista de benefícios
- Abra `components/faq.tsx` → Procure por perguntas/respostas

**No formulário:**
- Abra `components/conversion-form.tsx`
- Procure por `placeholder` nos inputs

**Emails:**
- Abra `send_lead.php`
- Procure por `$subject` (assunto) e `$body` (corpo do email)

### 10.2 Alterar Cores

**Usando Tailwind CSS:**
```tsx
// Procure por classes como:
className="bg-blue-500"  // Fundo azul
className="text-green-600"  // Texto verde
className="border-red-400"  // Borda vermelha

// Altere para:
className="bg-purple-500"  // Fundo roxo
```

**Cores personalizadas:**
- Abra `tailwind.config.js` ou `app/globals.css`
- Adicione cores customizadas

### 10.3 Alterar Imagens

**Substituir imagem:**
1. Coloque nova imagem em `public/images/`
2. No componente, procure por:
```tsx
<Image src="/images/nome-antiga.jpg" />
// Altere para:
<Image src="/images/nome-nova.jpg" />
```

### 10.4 Adicionar Nova Página

1. Crie pasta em `app/`:
```
app/nova-pagina/
└── page.tsx
```

2. No `page.tsx`:
```tsx
export default function NovaPagina() {
  return <div>Conteúdo da página</div>;
}
```

3. Acesse: `http://localhost:3000/nova-pagina`

### 10.5 Alterar Meta Tags (SEO)

No arquivo `app/layout.tsx`, procure por `metadata`:

```typescript
export const metadata: Metadata = {
  title: "Título aqui",
  description: "Descrição aqui",
  // ...
};
```

---

## 11. Testes e Debugging

### 11.1 Testar Formulário

1. Preencha todos os campos
2. Clique em "Receber cotação agora"
3. **Sucesso:** Redireciona para `/obrigado`
4. **Erro:** Aparece alerta com mensagem

**Verificar logs:**
- Console do navegador (F12) → Ver erros de rede
- Servidor PHP: Ver `error_log` no cPanel

### 11.2 Testar Tracking

1. Abra Console do navegador (F12)
2. Vá na aba "Console"
3. Procure por logs:
   - `📊 PageView disparado`
   - `✅ [Analytics] evento disparado`
   - `⏰ Usuário ficou 10s na página`

### 11.3 Verificar Erros

**No terminal (desenvolvimento):**
- Erros aparecem automaticamente
- Aperte `Ctrl+C` para parar o servidor

**No navegador:**
- F12 → Console → Ver erros em vermelho
- F12 → Network → Ver requisições falhadas

**No servidor PHP:**
- cPanel → File Manager → `error_log`
- Abra e veja últimos erros

### 11.4 Debug Mode

**Ativar debug do PHP:**
No `send_lead.php`, linha 185:
```php
$mail->SMTPDebug = 2; // 2 = verbose, 0 = desabilitado
```

**Ativar debug do tracking:**
No `.env.local`:
```env
NEXT_PUBLIC_TRACKING_DEBUG=true
```

---

## 12. Troubleshooting

### 12.1 Formulário não envia

**Sintomas:** Ao clicar em enviar, nada acontece ou aparece erro

**Soluções:**
1. Verifique se `send_lead.php` está no servidor
2. Verifique se a URL está correta em `conversion-form.tsx` (linha 70)
3. Abra Console (F12) → Ver mensagem de erro
4. Verifique `error_log` no servidor

### 12.2 Email não chega

**Sintomas:** Formulário envia, mas email não chega

**Soluções:**
1. Verifique senha do email no `send_lead.php` (linha 70)
2. Verifique configurações SMTP no cPanel
3. Ative debug: `$mail->SMTPDebug = 2;` em `send_lead.php`
4. Verifique pasta de spam
5. Confirme email destinatário no código (linha 198)

### 12.3 Erro de Autenticação SMTP

**Erro:** "SMTP Error: Could not authenticate"

**Soluções:**
1. Verifique senha no cPanel (pode ter mudado)
2. Atualize senha no `send_lead.php`
3. Verifique se username está correto (email completo)
4. Teste porta 587 com TLS (linha 72-73)

### 12.4 PHPMailer não encontrado

**Erro:** "PHPMailer não encontrado"

**Soluções:**
1. Verifique se pasta `phpmailer/` está no servidor
2. Estrutura correta: `phpmailer/src/Exception.php`
3. Verifique permissões da pasta (755)

### 12.5 Erro de Hidratação React

**Erro:** "Hydration mismatch"

**Soluções:**
1. Verifique uso de `window` ou `document` no servidor
2. Use `useEffect` para código do navegador
3. Verifique `suppressHydrationWarning` no `layout.tsx`

### 12.6 Localhost não carrega

**Sintomas:** `npm run dev` roda, mas localhost não abre

**Soluções:**
1. Verifique se porta 3000 está livre
2. Use `PORT=3001 npm run dev`
3. Limpe cache: `npm run clean`
4. Reinstale: `rm -rf node_modules && npm install`

---

## 🎯 Resumo Rápido

### Para começar:
```bash
npm install          # Instalar dependências
npm run dev          # Iniciar servidor local
```

### Para fazer alterações:
- **Textos:** Procure nos componentes (`components/`)
- **Estilos:** Use classes Tailwind ou edite `globals.css`
- **Formulário:** `components/conversion-form.tsx`
- **Email:** `send_lead.php`

### Para fazer deploy:
```bash
npm run build        # Gerar build
# Upload pasta /out para servidor
```

### Para testar:
- Localhost: `http://localhost:3000`
- Servidor: `https://app.aquiplanos.com.br`
- Console: F12 → Console

---

**📞 Precisa de ajuda?** Verifique a seção [Troubleshooting](#12-troubleshooting) ou os logs de erro!

