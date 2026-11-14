# Preparação para produção — Agência Bancária

## Situação atual
O projeto está hospedado no GitHub Pages e roda no navegador. Não existe backend, login, controle de acesso por administrador, banco central ou serviço de envio de e-mails. Não utilizar dados reais neste ambiente.

## Arquitetura necessária antes de uso real
1. Autenticação individual e autorização por função (administrador, atendimento, consulta).
2. API HTTPS com validação de sessão e autorização no servidor em todas as operações.
3. Banco de dados central com criptografia em trânsito e em repouso, gestão de chaves e backups testados.
4. Armazenamento privado de fotos/anexos, com URLs temporárias, limites de formato/tamanho, varredura de arquivos e controle de acesso.
5. Registro de auditoria para consulta, alteração, exportação e exclusão de cadastros.
6. Política de retenção, descarte, resposta a titulares e plano de incidentes.
7. Provedor transacional de e-mail no servidor, domínio verificado (SPF, DKIM e DMARC), templates aprovados, registro de envios e gestão de descadastramento quando aplicável.

## Dados de cartões
Não coletar nem armazenar CVV/CVC, PIN ou senha. A FAQ oficial do PCI Security Standards Council classifica CVV/CVC como dado de autenticação sensível e proíbe sua retenção após autorização, mesmo criptografado. Preferir tokenização por um provedor de pagamentos validado. Não guardar o número completo do cartão neste sistema.

## Dados pessoais
A LGPD (Lei 13.709/2018, art. 46) exige medidas técnicas e administrativas para proteger dados pessoais contra acesso não autorizado, perda, alteração e tratamento inadequado. A arquitetura de produção deve passar por análise de segurança e privacidade antes de ser utilizada com clientes.

## E-mail
A interface atual prepara e pré-visualiza mensagens. O envio precisa acontecer no backend, com credenciais mantidas em variáveis secretas do serviço, nunca em JavaScript público. O campo de assinatura atual representa uma imagem/texto visual, não uma assinatura eletrônica qualificada ou certificado digital.
