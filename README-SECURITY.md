# 🔒 Segurança - Configuração SMTP

## ⚠️ IMPORTANTE: Credenciais SMTP

As credenciais SMTP **NÃO devem** estar hardcoded no código. Elas foram movidas para um arquivo de configuração separado.

## 📋 Configuração

### 1. Criar arquivo de configuração

Copie o arquivo de exemplo:

```bash
cp config.example.php config.php
```

### 2. Editar config.php

Abra `config.php` e preencha com suas credenciais reais:

```php
<?php
return [
    'EMAIL_USER' => 'seu-email@dominio.com.br',
    'EMAIL_PASS' => 'sua-senha-aqui',
    'SMTP_HOST' => 'mail.dominio.com.br',
    'SMTP_PORT' => 465,
    'SMTP_SECURE' => 'ssl',
    'EMAIL_DESTINATARIO' => 'destinatario@exemplo.com',
];
```

### 3. Verificar .gitignore

O arquivo `config.php` já está no `.gitignore` e **não será commitado** no Git.

## 🔄 Se você já commitou credenciais

Se você já commitou credenciais no histórico do Git:

1. **IMEDIATAMENTE**: Altere a senha do email no cPanel/servidor
2. Remova as credenciais do código (já feito)
3. Use `git-filter-repo` ou `BFG Repo-Cleaner` para remover do histórico:
   ```bash
   # Instalar git-filter-repo
   pip install git-filter-repo
   
   # Remover credenciais do histórico
   git filter-repo --invert-paths --path send_lead.php
   git filter-repo --replace-text <(echo 'i%BR7@py{mMx-8W_==>REMOVED')
   ```
4. Force push (cuidado!):
   ```bash
   git push origin --force --all
   ```

## ✅ Checklist de Segurança

- [ ] Arquivo `config.php` criado e preenchido
- [ ] `config.php` está no `.gitignore`
- [ ] Senha do email alterada no servidor (se já foi exposta)
- [ ] Credenciais antigas removidas do histórico Git
- [ ] Testado envio de email após mudanças

## 📝 Notas

- O arquivo `config.example.php` pode ser commitado (é apenas um template)
- O arquivo `config.php` **NUNCA** deve ser commitado
- Use variáveis de ambiente em servidores que suportam (Heroku, Vercel, etc.)

