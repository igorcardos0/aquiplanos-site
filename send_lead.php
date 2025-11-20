<?php
// ================================================
// SCRIPT DE ENVIO DE LEAD - AQUI PLANOS
// ================================================

// 1. CONFIGURAÇÕES DE CORS (Cross-Origin Resource Sharing)
// Permite que seu site React (o 'frontend') se comunique com este script.
// Se souber o domínio exato do seu site (ex: https://www.aquiplanos.com.br),
// é mais seguro colocá-lo no lugar do "*".
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permite POST e a checagem OPTIONS
header("Access-Control-Allow-Headers: Content-Type"); // Permite o header Content-Type
header("Content-Type: application/json; charset=UTF-8");

// O navegador envia uma requisição "OPTIONS" antes do "POST" para checar o CORS.
// Este bloco responde "OK" para essa checagem.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. INCLUIR A BIBLIOTECA PHPMailer
// IMPORTANTE: Isso assume que você criou uma pasta "phpmailer" e
// colocou os arquivos da biblioteca PHPMailer dentro dela, no subdiretório "src".

// PRIMEIRO: Require os arquivos (precisa carregar as classes antes de usar "use")
// Usa __DIR__ para garantir que funciona independente de onde o script está sendo executado
// Tenta múltiplos caminhos caso a estrutura esteja diferente

$phpmailerPaths = [
    __DIR__ . '/phpmailer/src/Exception.php',
    __DIR__ . '/phpmailer/Exception.php',
    dirname(__FILE__) . '/phpmailer/src/Exception.php',
];

$phpmailerBasePath = null;
foreach ($phpmailerPaths as $path) {
    if (file_exists($path)) {
        $phpmailerBasePath = dirname($path);
        break;
    }
}

if (!$phpmailerBasePath) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erro: PHPMailer não encontrado. Verifique se a pasta phpmailer está no servidor."
    ]);
    exit;
}

require $phpmailerBasePath . '/Exception.php';
require $phpmailerBasePath . '/PHPMailer.php';
require $phpmailerBasePath . '/SMTP.php';

// DEPOIS: Use as classes (após os arquivos serem carregados)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// 3. CONFIGURAÇÃO DO SERVIDOR/EMAIL (O "CARTEIRO")
// CONFIGURAÇÕES CONFIRMADAS DO CPANEL:
// - Servidor SMTP: mail.aquiplanos.com.br
// - Porta SMTP: 465 (SSL)
// - Username: email completo (leadsaquiplanos@aquiplanos.com.br)
// - Requer autenticação: Sim
// - Senha: Configurada abaixo
define('EMAIL_USER', 'leadsaquiplanos@aquiplanos.com.br');
define('EMAIL_PASS', 'i%BR7@py{mMx-8W_'); // Senha do email configurada no cPanel
define('SMTP_HOST', 'mail.aquiplanos.com.br'); // Servidor de saída confirmado no cPanel
define('SMTP_PORT', 465); // Porta 465 (SSL) conforme cPanel
define('SMTP_SECURE', 'ssl'); // SSL para porta 465 conforme cPanel

// 4. COLETAR E VALIDAR DADOS
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não permitido."]);
    exit;
}

// Pega os dados JSON enviados pelo formulário React
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Log para debug (remover em produção)
error_log("📥 Dados recebidos: " . $rawInput);

// Verificar se conseguiu decodificar o JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => "Erro ao processar dados: " . json_last_error_msg(),
        "raw" => substr($rawInput, 0, 200) // Primeiros 200 caracteres para debug
    ]);
    exit;
}

if (empty($data['nome']) || empty($data['email']) || empty($data['telefone']) || empty($data['cnpj'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => "Por favor, preencha os campos obrigatórios.",
        "received_data" => array_keys($data) // Mostra quais campos foram recebidos
    ]);
    exit;
}

// Sanitização (limpeza) dos dados
$nome = htmlspecialchars($data['nome'] ?? 'Não informado');
$empresa = htmlspecialchars($data['empresa'] ?? 'Não informada');
$cargo = htmlspecialchars($data['cargo'] ?? 'Não informado');
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$telefone = htmlspecialchars($data['telefone'] ?? 'Não informado');
$vidas = htmlspecialchars($data['vidas'] ?? 'Não informado');
$cnpj = htmlspecialchars($data['cnpj'] ?? 'Não informado');
$operadora = htmlspecialchars($data['operadora'] ?? 'Nenhuma');


// 5. MONTAR O CONTEÚDO DO EMAIL
$subject = "⭐ NOVO LEAD: Cotação - {$empresa} ({$vidas} vidas)";

$body = "
    <html>
    <head>
        <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            th { background-color: #f2f2f2; width: 30%; font-weight: bold; }
        </style>
    </head>
    <body>
        <h2>Nova Cotação de Plano de Saúde Empresarial</h2>
        <table>
            <tr><th>Nome Completo:</th><td>{$nome}</td></tr>
            <tr><th>Empresa:</th><td>{$empresa}</td></tr>
            <tr><th>CNPJ:</th><td>{$cnpj}</td></tr>
            <tr><th>Cargo:</th><td>{$cargo}</td></tr>
            <tr><th>Vidas:</th><td>{$vidas}</td></tr>
            <tr><th>E-mail:</th><td>{$email}</td></tr>
            <tr><th>Telefone:</th><td>{$telefone}</td></tr>
            <tr><th>Operadora Atual:</th><td>{$operadora}</td></tr>
        </table>
        <br>
        <p><em>Enviado automaticamente do site Aqui Planos.</em></p>
    </body>
    </html>
";


// 6. ENVIAR O EMAIL COM PHPMailer
// Função auxiliar para tentar enviar com uma configuração específica
function tentarEnviarEmail($config) {
    $mail = new PHPMailer(true);
    
    try {
        // Configurações do SMTP
        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['username'];
        $mail->Password = $config['password'];
        $mail->SMTPSecure = $config['secure'];
        $mail->Port = $config['port'];
        $mail->CharSet = 'UTF-8';
        
        // Opções SSL/TLS para resolver problemas de autenticação
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ),
            'tls' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Debug HABILITADO para capturar erros detalhados
        // Os logs vão para o error_log do PHP
        $mail->SMTPDebug = 2; // Nível 2 = mostra conexão e comandos SMTP
        $mail->Debugoutput = function($str, $level) {
            // Salva debug em arquivo e também retorna na resposta
            error_log("PHPMailer Debug [$level]: $str");
            // Armazena para retornar ao usuário
            if (!isset($GLOBALS['smtp_debug_log'])) {
                $GLOBALS['smtp_debug_log'] = [];
            }
            $GLOBALS['smtp_debug_log'][] = trim($str);
        };

        // Configurar email
        $mail->setFrom($config['from_email'], 'Formulário Aqui Planos');
        $mail->addAddress('igor.souza@v4company.com');
        $mail->addReplyTo($config['reply_to'], $config['reply_to_name']);
        $mail->isHTML(true);
        $mail->Subject = $config['subject'];
        $mail->Body = $config['body'];

        $mail->send();
        return ['success' => true, 'message' => 'Email enviado com sucesso!'];
        
    } catch (Exception $e) {
        $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
        
        // Adiciona informações de diagnóstico específicas
        $diagnostico = [];
        
        // Verificar se é erro de autenticação
        if (stripos($errorMsg, 'authenticate') !== false || stripos($errorMsg, 'authentication') !== false) {
            $diagnostico[] = "AUTENTICAÇÃO FALHOU - Verifique:";
            $diagnostico[] = "1. Senha do email no cPanel (pode estar incorreta ou expirada)";
            $diagnostico[] = "2. Username correto: '{$config['username']}'";
            $diagnostico[] = "3. Conta de email ativa e não bloqueada";
        }
        
        // Adiciona logs de debug se disponíveis
        if (isset($GLOBALS['smtp_debug_log']) && !empty($GLOBALS['smtp_debug_log'])) {
            $debugInfo = implode(' | ', array_slice($GLOBALS['smtp_debug_log'], -3)); // Últimas 3 linhas
            $errorMsg .= ' | Debug: ' . $debugInfo;
            unset($GLOBALS['smtp_debug_log']);
        }
        
        // Adiciona diagnóstico
        if (!empty($diagnostico)) {
            $errorMsg .= ' | ' . implode(' | ', $diagnostico);
        }
        
        // Adiciona informações da configuração tentada
        $errorMsg .= ' | Config testada: ' . $config['host'] . ':' . $config['port'] . ' (' . $config['secure'] . ')';
        
        return ['success' => false, 'message' => $errorMsg];
    }
}

// Preparar dados do email
$emailConfig = [
    'subject' => $subject,
    'body' => $body,
    'from_email' => EMAIL_USER,
    'reply_to' => $email,
    'reply_to_name' => $nome,
];

// Lista de configurações para tentar (na ordem de prioridade)
// PRIMEIRO: Configuração exata do cPanel (porta 465 SSL com email completo)
// DEPOIS: Alternativas caso a primeira não funcione
$configuracoes = [
    // Configuração 1: EXATA DO CPANEL - Porta 465 SSL com email completo
    [
        'host' => SMTP_HOST,
        'username' => EMAIL_USER, // Email completo conforme cPanel
        'password' => EMAIL_PASS,
        'secure' => 'ssl',
        'port' => 465,
    ],
    // Configuração 2: Porta 587 TLS (alternativa comum)
    [
        'host' => SMTP_HOST,
        'username' => EMAIL_USER,
        'password' => EMAIL_PASS,
        'secure' => 'tls',
        'port' => 587,
    ],
    // Configuração 3: Porta 465 SSL com username simples (caso servidor aceite)
    [
        'host' => SMTP_HOST,
        'username' => 'leadsaquiplanos', // Apenas username (sem @)
        'password' => EMAIL_PASS,
        'secure' => 'ssl',
        'port' => 465,
    ],
];

// Tentar cada configuração até uma funcionar
$resultado = null;
$ultimoErro = '';

foreach ($configuracoes as $config) {
    $configCompleta = array_merge($emailConfig, $config);
    $resultado = tentarEnviarEmail($configCompleta);
    
    if ($resultado['success']) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => $resultado['message']]);
        exit;
    }
    
    $ultimoErro = $resultado['message'];
}

// Se nenhuma configuração funcionou, retornar erro detalhado
http_response_code(500);

// Mensagem de erro mais detalhada
$erroFinal = "Erro ao enviar: " . $ultimoErro;

// Adicionar instruções de solução
$erroFinal .= "\n\n🔧 SOLUÇÃO RECOMENDADA:\n";
$erroFinal .= "1. Acesse o cPanel → Email Accounts\n";
$erroFinal .= "2. Encontre: leadsaquiplanos@aquiplanos.com.br\n";
$erroFinal .= "3. Clique em 'Alterar Senha' ou 'Change Password'\n";
$erroFinal .= "4. Defina uma senha nova e simples (sem caracteres especiais)\n";
$erroFinal .= "5. Atualize a senha na linha 70 do send_lead.php\n";
$erroFinal .= "6. Teste novamente\n\n";

// Verificações adicionais
$verificacoes = [];
if (EMAIL_PASS === '[Pl@#25@nos]') {
    $verificacoes[] = "⚠️ Senha padrão detectada - VERIFIQUE SE A SENHA ESTÁ CORRETA NO CPANEL";
}
if (!function_exists('openssl_open')) {
    $verificacoes[] = "Extensão OpenSSL não está habilitada no PHP";
}

if (!empty($verificacoes)) {
    $erroFinal .= "AVISOS: " . implode(" | ", $verificacoes) . "\n";
}

$erroFinal .= "Configurações testadas: " . SMTP_HOST . " (465/SSL, 587/TLS) | User: " . EMAIL_USER;

echo json_encode([
    "success" => false, 
    "message" => $erroFinal,
    "debug_info" => [
        "host" => SMTP_HOST,
        "portas_testadas" => "465 (SSL), 587 (TLS)",
        "username" => EMAIL_USER,
        "senha_configured" => !empty(EMAIL_PASS) && EMAIL_PASS !== '[Pl@#25@nos]' ? "SIM" : "VERIFICAR NO CPANEL"
    ]
]);
?>