# Agência Bancária — Painel de Gestão

Painel demonstrativo de gestão de clientes e atendimento, desenvolvido em HTML, CSS e JavaScript puro e publicado pelo GitHub Pages.

## Funcionalidades
- Dashboard com indicadores locais de clientes e atendimentos
- Cadastro com foto de perfil, múltiplos e-mails, múltiplas instituições/agências e referências de cartões limitadas à bandeira e aos quatro últimos dígitos
- Upload local de foto e documentos (IndexedDB do navegador)
- Atendimento com geração de protocolos, histórico, filtros e conclusão de solicitações
- Área de e-mails com editor de texto formatado, modelos, configurações de remetente e assinatura visual provisória
- Prévia da mensagem antes do envio
- Exportação da lista básica de clientes para PNG, PDF, XLSX e TXT
- Planilha XLSX com título institucional, tabela com filtros, cabeçalho padronizado, linhas alternadas, larguras ajustadas, painel congelado e aba de orientações
- Compatibilidade com dados antigos em `clientes_demo` e `atendimentos_demo`

## Publicação
O arquivo `index.html` é publicado automaticamente no GitHub Pages pelo workflow `.github/workflows/pages.yml` a cada atualização da branch `main`.

## Limitações desta versão
Esta é uma aplicação estática demonstrativa. Dados textuais ficam no `localStorage`; fotos, anexos e imagem de assinatura ficam no `IndexedDB` do navegador que realizou o cadastro. Os registros não são compartilhados entre administradores, navegadores ou dispositivos.

- O campo CPF está bloqueado até existir um backend seguro.
- A aplicação guarda somente referências de cartão (bandeira, identificação e últimos quatro dígitos). Não coleta nem armazena número completo, validade, CVV/CVC, PIN ou senha.
- O envio de e-mails não está ativo; a tela permite configurar remetente/modelo, editar e pré-visualizar mensagens. Um backend autenticado e provedor de e-mail precisam ser integrados antes do envio real.
- A imagem da assinatura é apenas visual e não constitui assinatura digital certificada.
- A aplicação ainda não possui login, perfis/permissões de administradores, banco de dados central, trilha de auditoria ou armazenamento seguro compartilhado.

**Não use dados reais de clientes nesta versão.** Antes do uso operacional, implemente autenticação e autorização por perfil, API HTTPS, banco de dados com criptografia e segregação de acesso, armazenamento privado de arquivos, logs de auditoria, cópias de segurança, política de retenção e fluxo de atendimento aos direitos dos titulares da LGPD. Nunca armazene códigos CVV/CVC, PIN ou senhas.
