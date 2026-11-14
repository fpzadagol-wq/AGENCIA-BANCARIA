# Portal de Gestão

O projeto reúne a Agência Bancária e o FluxoPay em uma interface única, com autenticação compartilhada.

## Arquivos principais

- `index.html`: portal protegido que abre os dois módulos.
- `login.html`: tela de autenticação e configuração inicial do administrador.
- `agencia.html`: painel Agência Bancária.
- `gateway.html`: painel FluxoPay.
- `usuarios.html`: administração compartilhada de usuários.
- `auth-client.js` e `auth-config.js`: cliente de sessão e endereço da API.
- `cloudflare/worker.js`: API de autenticação.
- `cloudflare/schema.sql`: estrutura do banco Cloudflare D1.
- `wrangler.toml`: configuração inicial de publicação.

## Publicação da autenticação no Cloudflare

A autenticação está preparada no repositório, mas só ficará ativa depois de publicar o Worker e criar o banco D1 na conta Cloudflare autorizada.

1. Instale o Node.js e autentique o Wrangler na conta Cloudflare:
   `npx wrangler login`
2. Na raiz do repositório, crie o banco:
   `npx wrangler d1 create portal-acessos`
3. Copie o `database_id` retornado para `wrangler.toml`, substituindo `PREENCHER_COM_O_ID_DO_D1`.
4. Aplique a estrutura:
   `npx wrangler d1 execute portal-acessos --remote --file=cloudflare/schema.sql`
5. Cadastre os segredos:
   `npx wrangler secret put SESSION_SECRET`
   `npx wrangler secret put BOOTSTRAP_KEY`
   Use valores longos, aleatórios e diferentes. Não os publique no GitHub nem os envie pelo chat.
6. Publique a API:
   `npx wrangler deploy`
7. Copie a URL `workers.dev` exibida e substitua o endereço de exemplo em `auth-config.js` por essa URL. Faça commit e publique o site novamente.
8. Abra `login.html`. Na primeira configuração, informe a chave `BOOTSTRAP_KEY`, defina o login e a senha do administrador principal (mínimo de 12 caracteres) e crie a conta. Depois entre normalmente.

O Worker aceita requisições somente da origem configurada em `ALLOWED_ORIGIN`. Se o domínio do site mudar, atualize essa variável e publique novamente o Worker.

## Segurança de acesso

- Senhas são armazenadas como hashes PBKDF2-SHA-256 com salt individual; não existe tela para consultar a senha original.
- Administradores podem redefinir senhas e gerenciar permissões.
- Sessões expiram após oito horas.
- A API impede desativar ou rebaixar o último administrador ativo.
- Nunca coloque senhas, tokens ou chaves privadas em arquivos públicos.

## Dados operacionais e pagamentos

O login centraliza o acesso, mas não migra automaticamente os registros operacionais que os painéis já mantêm no navegador. A Agência Bancária e o FluxoPay ainda precisam de uma etapa própria de migração desses dados para armazenamento compartilhado no D1 antes de serem usados como sistema multiusuário com dados reais.

O FluxoPay também depende da integração com um provedor de pagamentos para criar cobranças e confirmar liquidações. A interface, por si só, não movimenta dinheiro. Não apresente uma cobrança como paga sem confirmação autenticada do provedor.

Site: https://fpzadagol-wq.github.io/AGENCIA-BANCARIA/
