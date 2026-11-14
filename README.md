# Portal de Painéis

O projeto reúne dois módulos independentes em uma única página inicial, publicada pelo GitHub Pages.

## Módulos

- **Agência Bancária** — painel original preservado em `agencia.html`.
- **Gateway de Pagamentos (FluxoPay)** — segundo painel em `gateway.html`.
- **Portal inicial** — `index.html`, com navegação entre os dois módulos.

## Observação sobre pagamentos

O FluxoPay atualmente é uma interface demonstrativa. Os cadastros e lançamentos ficam no armazenamento local do navegador; não processam pagamentos reais, não criam cobranças PIX/cartão/boleto e não liquidam valores. Para produção, é necessário backend seguro, provedor de pagamentos aprovado, onboarding/autorização dos recebedores e webhooks autenticados.

Não coloque tokens, senhas bancárias, PIN ou CVV no frontend ou neste repositório. GitHub Pages hospeda apenas arquivos estáticos e não executa backend.

## Publicação

https://fpzadagol-wq.github.io/AGENCIA-BANCARIA/
