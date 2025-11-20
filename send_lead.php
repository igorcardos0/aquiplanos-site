<?php
// Configuração SMTP: credenciais devem estar em config.php (não commitado) ou variáveis de ambiente
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Carrega configurações do arquivo config.php ou usa variáveis de ambiente
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
    $config = require $configFile;
    define('EMAIL_USER', $config['EMAIL_USER'] ?? '');
    define('EMAIL_PASS', $config['EMAIL_PASS'] ?? '');
    define('SMTP_HOST', $config['SMTP_HOST'] ?? '');
    define('SMTP_PORT', $config['SMTP_PORT'] ?? 465);
    define('SMTP_SECURE', $config['SMTP_SECURE'] ?? 'ssl');
    define('EMAIL_DESTINATARIO', $config['EMAIL_DESTINATARIO'] ?? 'igor.souza@v4company.com');
} else {
    // Fallback para variáveis de ambiente (útil para servidores que suportam)
    define('EMAIL_USER', getenv('SMTP_USER') ?: '');
    define('EMAIL_PASS', getenv('SMTP_PASS') ?: '');
    define('SMTP_HOST', getenv('SMTP_HOST') ?: '');
    define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 465));
    define('SMTP_SECURE', getenv('SMTP_SECURE') ?: 'ssl');
    define('EMAIL_DESTINATARIO', getenv('EMAIL_DESTINATARIO') ?: 'igor.souza@v4company.com');
}

// Valida se as configurações essenciais estão definidas
if (empty(EMAIL_USER) || empty(EMAIL_PASS) || empty(SMTP_HOST)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro: Configurações SMTP não encontradas. Crie o arquivo config.php baseado em config.example.php"
    ]);
    exit;
}

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

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não permitido."]);
    exit;
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

error_log("📥 Dados recebidos: " . $rawInput);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => "Erro ao processar dados: " . json_last_error_msg(),
        "raw" => substr($rawInput, 0, 200)
    ]);
    exit;
}

if (empty($data['nome']) || empty($data['email']) || empty($data['telefone']) || empty($data['cnpj'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => "Por favor, preencha os campos obrigatórios.",
        "received_data" => array_keys($data)
    ]);
    exit;
}

$nome = htmlspecialchars($data['nome'] ?? 'Não informado');
$empresa = htmlspecialchars($data['empresa'] ?? 'Não informada');
$cargo = htmlspecialchars($data['cargo'] ?? 'Não informado');
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$telefone = htmlspecialchars($data['telefone'] ?? 'Não informado');
$vidas = htmlspecialchars($data['vidas'] ?? 'Não informado');
$cnpj = htmlspecialchars($data['cnpj'] ?? 'Não informado');
$operadora = htmlspecialchars($data['operadora'] ?? 'Nenhuma');

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


function tentarEnviarEmail($config) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['username'];
        $mail->Password = $config['password'];
        $mail->SMTPSecure = $config['secure'];
        $mail->Port = $config['port'];
        $mail->CharSet = 'UTF-8';
        
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
        
        $mail->SMTPDebug = 2;
        $mail->Debugoutput = function($str, $level) {
            error_log("PHPMailer Debug [$level]: $str");
            if (!isset($GLOBALS['smtp_debug_log'])) {
                $GLOBALS['smtp_debug_log'] = [];
            }
            $GLOBALS['smtp_debug_log'][] = trim($str);
        };

        $mail->setFrom($config['from_email'], 'Formulário Aqui Planos');
        $mail->addAddress(EMAIL_DESTINATARIO);
        $mail->addReplyTo($config['reply_to'], $config['reply_to_name']);
        $mail->isHTML(true);
        $mail->Subject = $config['subject'];
        $mail->Body = $config['body'];

        $mail->send();
        return ['success' => true, 'message' => 'Email enviado com sucesso!'];
        
    } catch (Exception $e) {
        $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
        
        $diagnostico = [];
        
        if (stripos($errorMsg, 'authenticate') !== false || stripos($errorMsg, 'authentication') !== false) {
            $diagnostico[] = "AUTENTICAÇÃO FALHOU - Verifique:";
            $diagnostico[] = "1. Senha do email no cPanel (pode estar incorreta ou expirada)";
            $diagnostico[] = "2. Username correto: '{$config['username']}'";
            $diagnostico[] = "3. Conta de email ativa e não bloqueada";
        }
        
        if (isset($GLOBALS['smtp_debug_log']) && !empty($GLOBALS['smtp_debug_log'])) {
            $debugInfo = implode(' | ', array_slice($GLOBALS['smtp_debug_log'], -3));
            $errorMsg .= ' | Debug: ' . $debugInfo;
            unset($GLOBALS['smtp_debug_log']);
        }
        
        if (!empty($diagnostico)) {
            $errorMsg .= ' | ' . implode(' | ', $diagnostico);
        }
        
        $errorMsg .= ' | Config testada: ' . $config['host'] . ':' . $config['port'] . ' (' . $config['secure'] . ')';
        
        return ['success' => false, 'message' => $errorMsg];
    }
}

$emailConfig = [
    'subject' => $subject,
    'body' => $body,
    'from_email' => EMAIL_USER,
    'reply_to' => $email,
    'reply_to_name' => $nome,
];

$configuracoes = [
    [
        'host' => SMTP_HOST,
        'username' => EMAIL_USER,
        'password' => EMAIL_PASS,
        'secure' => 'ssl',
        'port' => 465,
    ],
    [
        'host' => SMTP_HOST,
        'username' => EMAIL_USER,
        'password' => EMAIL_PASS,
        'secure' => 'tls',
        'port' => 587,
    ],
    [
        'host' => SMTP_HOST,
        'username' => 'leadsaquiplanos',
        'password' => EMAIL_PASS,
        'secure' => 'ssl',
        'port' => 465,
    ],
];

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

http_response_code(500);

$erroFinal = "Erro ao enviar: " . $ultimoErro;

$erroFinal .= "\n\n🔧 SOLUÇÃO RECOMENDADA:\n";
$erroFinal .= "1. Acesse o cPanel → Email Accounts\n";
$erroFinal .= "2. Verifique as credenciais do email\n";
$erroFinal .= "3. Atualize o arquivo config.php com as credenciais corretas\n";
$erroFinal .= "4. Certifique-se de que config.php existe e está configurado corretamente\n";
$erroFinal .= "5. Teste novamente\n\n";

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