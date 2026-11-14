# Agência Bancária — Painel de Gestão

Interface demonstrativa de uma agência bancária, desenvolvida em HTML, CSS e JavaScript puro, sem dependências externas.

## Funcionalidades

- Dashboard com indicadores calculados a partir dos registros locais
- Cadastro, consulta, edição, pesquisa e exclusão de clientes
- Central de atendimento com geração de protocolos
- Histórico com filtros por status, setor e pesquisa
- Atualização de status dos protocolos
- Relatórios de volume, setores e status
- Exportação do histórico em CSV e backup em JSON
- Layout responsivo para desktop, tablet e celular
- Compatibilidade com os dados locais legados (`clientes_demo` e `atendimentos_demo`)

## Como publicar

O projeto é estático. O arquivo `index.html` é publicado no GitHub Pages pelo workflow em `.github/workflows/pages.yml`, automaticamente a cada atualização da branch `main`.

## Armazenamento e segurança

Os dados são armazenados no `localStorage` do navegador. Eles não são sincronizados entre usuários ou dispositivos e podem ser removidos ao limpar os dados do navegador.

**Esta plataforma é apenas demonstrativa.** Não possui autenticação, backend, conexão com instituições financeiras ou operações bancárias reais. Não insira senhas, números de cartão, documentos ou dados financeiros verdadeiros.
