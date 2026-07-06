# Workflow do Codex

## Como iniciar uma tarefa

1. Ler AGENTS.md.
2. Ler docs/project/PRODUCT_VISION.md.
3. Ler docs/project/DECISIONS.md.
4. Ler docs/project/SPRINTS.md.
5. Ler docs/project/ARCHITECTURE.md.
6. Ler o agente especifico em docs/agents quando aplicavel.
7. Ler docs/project/DEFINITION_OF_DONE.md.

## Como interpretar uma sprint

Codex deve identificar objetivo unico, fora de escopo, criterios de aceite, comandos de validacao e observacoes. Se a tarefa pedida nao couber na sprint atual, deve apontar o conflito antes de implementar.

## Como propor plano

O plano deve ser pequeno, verificavel e alinhado aos documentos. Quando houver ambiguidade relevante, Codex deve pedir ou registrar decisao.

## Como implementar

- Uma sprint por vez.
- Escopo pequeno.
- Sem dependencias sem justificativa.
- Sem features futuras.
- Sem Bootstrap no app desktop.
- Separar frontend, Rust/Tauri, storage, dominio e UI.

## Como validar

Quando houver codigo, executar comandos adequados de formatacao, lint, testes e build. Quando houver apenas documentacao, validar existencia, coerencia e links principais.

## Como reportar alteracoes

Relatar arquivos criados ou alterados, decisoes registradas, validacoes executadas e pendencias.

## Quando nao avancar

- Quando a tarefa exige decisao de produto nao registrada.
- Quando o pedido contradiz decisao aprovada.
- Quando a mudanca exige dependencia sem justificativa.
- Quando o escopo mistura multiplas sprints.
- Quando envolve distribuicao de conteudo protegido.

## Como lidar com erros

Erros devem ser explicitados, investigados e corrigidos dentro do escopo. Codex nao deve esconder falhas de build, teste ou validacao.

## Como atualizar documentacao

Toda mudanca que altera comportamento, arquitetura, politica ou roadmap deve atualizar os documentos correspondentes e, quando necessario, docs/project/DECISIONS.md.

