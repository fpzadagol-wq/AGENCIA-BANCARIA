# Portal de Painéis

O projeto reúne dois módulos independentes em uma única página inicial, publicada pelo GitHub Pages.

## Módulos
- Agência Bancária — painel de gestão em agencia.html.
- Gateway de Pagamentos (FluxoPay) — módulo em gateway.html.
- Portal inicial — index.html, com autenticação antes do acesso aos painéis.
- Usuários — usuarios.html, com gerenciamento compartilhado de contas.

## Autenticação compartilhada
A autenticação usa Cloudflare Workers e D1. O mesmo login dá acesso aos dois painéis. Administradores podem criar, bloquear, reativar, excluir usuários e redefinir senhas. As senhas são armazenadas com hash PBKDF2-SHA-256 e salt individual; não ficam visíveis nem em texto puro. A recuperação é feita por redefinição administrativa.

### Configuração no Cloudflare
1. Crie um banco D1 chamado agencia-bancaria-auth.
2. Execute o conteúdo de cloudflare/schema.sql no banco.
3. Crie um Worker usando cloudflare/worker.js e vincule o banco D1 com binding DB.
4. Configure as variáveis/secrets do Worker:
   - ALLOWED_ORIGIN = https://fpzadagol-wq.github.io
   - SESSION_SECRET = segredo aleatório forte, exclusivo do Worker
   - BOOTSTRAP_KEY = chave aleatória forte para a criação inicial do administrador
5. Publique o Worker em workers.dev.
6. Atualize auth-config.js com a URL real publicada pelo Worker.
7. Abra login.html. Use a chave BOOTSTRAP_KEY para criar o primeiro administrador e defina uma senha de pelo menos 12 caracteres. Depois, entre normalmente. A inicialização só pode ocorrer uma vez enquanto houver usuários na base.

## Dados operacionais e pagamentos
Os registros operacionais existentes nos módulos ainda são armazenados no navegador e não passam a ser sincronizados pelo D1 de autenticação. A interface informa esse comportamento nas configurações, sem mensagens de ambiente fictício.

O FluxoPay ainda depende da configuração de um provedor autorizado para criar cobranças e confirmar liquidações. Não considere um lançamento interno como pagamento recebido. Para ativar pagamentos, será necessário implementar e homologar a integração com o provedor escolhido.

## Publicação
https://fpzadagol-wq.github.io/AGENCIA-BANCARIA/
