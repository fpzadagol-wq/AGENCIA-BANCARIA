# FluxoPay — painel demonstrativo

Este repositório contém a interface estática do painel FluxoPay, publicada pelo GitHub Pages.

## O que existe nesta versão

- Painel com indicadores e atividade local.
- Cadastro demonstrativo de recebedores (pessoa física ou jurídica).
- Seleção manual do recebedor ativo na interface.
- Histórico de lançamentos de teste.
- Prévia visual de checkout.
- Área de requisitos para integração do provedor.

## Limitações importantes

Esta versão **não processa pagamentos reais**. Os dados ficam no `localStorage` do navegador e não são sincronizados entre dispositivos. O cadastro de um recebedor não valida titularidade, não cria subconta e não autoriza liquidação.

Não colete nem armazene senhas bancárias, PIN, CVV/CVC ou tokens de acesso no frontend. Não coloque credenciais secretas no repositório GitHub.

## Próximas etapas para pagamentos reais

1. Escolher um provedor que aceite onboarding de recebedores terceiros e confirme se permite liquidação direta para contas de diferentes instituições.
2. Criar um backend hospedado fora do GitHub Pages.
3. Guardar credenciais do provedor em variáveis de ambiente no backend.
4. Implementar autenticação de administradores, banco de dados e trilha de auditoria para mudanças de recebedor.
5. Criar checkout real com PIX/cartão/boleto conforme o contrato e os recursos liberados pelo provedor.
6. Receber webhooks autenticados e validar o estado do pagamento no servidor antes de marcar um pedido como pago.
7. Homologar o fluxo com o provedor antes de aceitar pagamentos de clientes.

## Publicação

O frontend pode ser servido pelo GitHub Pages: https://fpzadagol-wq.github.io/AGENCIA-BANCARIA/

O GitHub Pages hospeda arquivos estáticos; não executa backend, não protege segredos e não recebe webhooks.
