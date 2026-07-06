# OpenArtDesk - Guia para Codex

OpenArtDesk e um aplicativo desktop open source, local-first e offline-first para estudantes organizarem arquivos, PDFs, estudos, referencias, atividades e materiais locais no proprio computador.

O primeiro publico e a comunidade de arte e estudos criativos, mas a arquitetura deve permitir evolucao para outros tipos de estudo e organizacao pessoal.

## Estado atual

Este repositorio concluiu a Sprint 4: preferencias locais em JSON.

Ja existe uma base inicial Tauri 2 + React + Vite + TypeScript na raiz do repositorio, com Tailwind CSS v4, module registry tipado, rotas centralizadas, paginas placeholder reutilizaveis, design tokens por CSS variables, temas claro/escuro/system, densidade, cor de destaque, componentes UI basicos e persistencia local de preferencias via JSON usando Tauri/Rust. Ainda nao ha SQLite, dados reais, upload de PDF, backup, IA, plugins, leitor PDF embutido, release ou instalador.

## Stack futura aprovada

- Tauri 2
- Rust
- React
- Vite
- TypeScript
- Tailwind CSS
- SQLite
- Zustand
- React Hook Form
- Zod
- date-fns
- nanoid
- lucide-react
- sonner
- Vitest
- React Testing Library

## Filosofia

- Desktop desde o dia zero.
- Local-first e offline-first.
- Privacidade por padrao.
- Dados sob controle do usuario.
- Modularidade para novas abas e dominios.
- Customizacao como parte central do produto.
- Open source com contribuicao responsavel.

## Ordem obrigatoria de leitura

1. AGENTS.md
2. docs/project/PRODUCT_VISION.md
3. docs/project/DECISIONS.md
4. docs/project/SPRINTS.md
5. docs/project/ARCHITECTURE.md
6. Agente especifico em docs/agents conforme a tarefa
7. docs/project/DEFINITION_OF_DONE.md

## Regras de execucao

- Trabalhar em micro-sprints.
- Implementar uma sprint por vez.
- Nunca implementar fora do escopo da sprint atual.
- Consultar docs/project/SPRINTS.md antes de implementar.
- Registrar decisoes relevantes em docs/project/DECISIONS.md.
- Atualizar documentacao quando o comportamento planejado mudar.
- Separar frontend, Tauri/Rust, storage, dominio e UI.
- Validar com comandos adequados quando houver codigo.
- Nesta etapa, nao criar codigo funcional.

## Regras anti-escopo

- Nao inicializar Tauri antes da sprint propria.
- Nao criar React/Vite antes da sprint propria.
- Nao instalar dependencias sem justificativa e sprint aprovada.
- Nao criar SQLite antes da sprint propria.
- Nao implementar telas, funcionalidades, rotas ou comandos.
- Nao adicionar login, sync, IA, plugins ou leitor PDF embutido no MVP.
- Nao usar Bootstrap no app desktop.
- Bootstrap pode ser referencia apenas para o futuro site Como Instalar.

## Definition of Done resumida

- Escopo da sprint respeitado.
- Documentacao atualizada.
- Decisoes registradas.
- Build/testes executados quando houver codigo.
- Sem dependencias desnecessarias.
- Sem features futuras implementadas antes da hora.
- Privacidade e dados locais preservados.
- Politica de conteudo respeitada.

## Comandos futuros provaveis

Comandos atuais da base desktop:

- `npm run dev`
- `npm run build`
- `npm run tauri dev`

Comandos de release e empacotamento continuam futuros:

- Futuro: gerar build desktop instalavel.
- Futuro: empacotar instalador Windows.

## Norte de trabalho

Codex atua como executor tecnico, nao como decisor solto. Quando houver ambiguidade relevante, deve registrar a duvida, propor opcoes e pedir decisao antes de consolidar arquitetura ou escopo.
