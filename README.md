# Portal de Painéis

O projeto reúne dois módulos independentes em uma página inicial protegida por autenticação, publicada pelo GitHub Pages.

## Módulos
- Agência Bancária — painel de gestão em agencia.html.
- Gateway de Pagamentos (FluxoPay) — módulo em gateway.html.
- Portal inicial e login — index.html e login.html.
- Usuários — usuarios.html, com gerenciamento compartilhado de contas.

## Autenticação compartilhada
A autenticação usa Cloudflare Workers e D1. O mesmo login dá acesso aos dois painéis. Administradores podem criar usuários, escolher perfis, bloquear, reativar, excluir e redefinir senhas. As senhas são armazenadas com hash PBKDF2-SHA-256 e salt individual; não ficam visíveis nem em texto puro. Quando alguém esquece a senha, o administrador pode redefini-la.

## Publicar o serviço de autenticação no Cloudflare
É necessário concluir esta configuração antes de liberar o acesso público:
1. Instale Node.js e Wrangler: npm install -g wrangler.
2. Faça login no Cloudflare: wrangler login.
3. Entre na pasta cloudflare e crie o banco: wrangler d1 create agencia-bancaria-auth.
4. Copie o database_id retornado para cloudflare/wrangler.toml, substituindo PREENCHER_COM_ID_DO_D1.
5. Crie as tabelas: wrangler d1 execute agencia-bancaria-auth --remote --file=schema.sql.
6. Configure os segredos do Worker:
   - wrangler secret put SESSION_SECRET — use um segredo aleatório forte, exclusivo, com pelo menos 32 bytes.
   - wrangler secret put BOOTSTRAP_KEY — use outra chave aleatória forte; será solicitada uma única vez ao criar o primeiro administrador.
7. Publique o Worker: wrangler deploy.
8. Copie a URL workers.dev gerada e configure API_BASE_URL em auth-config.js.
9. Publique as alterações do repositório pelo GitHub Pages e abra login.html. Use a BOOTSTRAP_KEY para criar o primeiro administrador e defina uma senha com pelo menos 12 caracteres.

O Worker aplica bloqueio temporário após cinco tentativas de login inválidas. O banco também mantém trilha de auditoria das ações administrativas.

## Dados operacionais e pagamentos
Os cadastros operacionais que já existem nos módulos continuam armazenados no navegador e não passam a ser sincronizados pelo D1 de autenticação. A sincronização desses registros exige uma implementação separada de API e banco central.

O FluxoPay ainda depende da configuração e homologação de um provedor autorizado para criar cobranças e confirmar liquidações. Um lançamento interno do painel não deve ser tratado como pagamento recebido.

## Publicação
https://fpzadagol-wq.github.io/AGENCIA-BANCARIA/
