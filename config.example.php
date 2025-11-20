<?php
/**
 * Arquivo de Configuração SMTP - Template
 * 
 * INSTRUÇÕES:
 * 1. Copie este arquivo para config.php: cp config.example.php config.php
 * 2. Preencha as credenciais reais no config.php
 * 3. O arquivo config.php já está no .gitignore e não será commitado
 */

return [
    'EMAIL_USER' => 'seu-email@dominio.com.br',
    'EMAIL_PASS' => 'sua-senha-aqui',
    'SMTP_HOST' => 'mail.dominio.com.br',
    'SMTP_PORT' => 465,
    'SMTP_SECURE' => 'ssl',
    'EMAIL_DESTINATARIO' => 'destinatario@exemplo.com',
];

