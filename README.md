# OpenArtDesk

OpenArtDesk e um aplicativo desktop open source, local-first e offline-first para estudantes organizarem arquivos, PDFs, estudos, referencias, atividades e materiais locais no proprio computador.

## Status

Base desktop inicial criada na Sprint 1.

Ainda nao ha instalador, release, SQLite, dados reais, upload de PDF, backup ou funcionalidades de dominio.

## Visao

Um desktop app open source para organizar conhecimento, arquivos e atividades de estudo localmente.

O primeiro caso de uso sera a comunidade de arte e estudos criativos. A arquitetura deve permitir evolucao para outros contextos de estudo e organizacao pessoal.

## Principios

- Local-first
- Offline-first
- Open source
- Customizavel
- Modular
- Visual
- Produtivo
- Privacidade por padrao
- Liberdade dos dados

## Stack planejada

- Tauri 2, Rust
- React, Vite, TypeScript
- Tailwind CSS
- SQLite
- Zustand
- React Hook Form, Zod
- Vitest, React Testing Library

## Desenvolvimento local

Comandos iniciais da base desktop:

```bash
npm run dev
npm run build
npm run tauri dev
```

Observacao: nao ha comandos de instalacao para usuarios finais ainda. O primeiro instalador Windows sera tratado em sprint futura.

## Modulos planejados

MVP:

- Onboarding
- Dashboard
- Minha Biblioteca
- Estudos
- Referencias
- Atividades
- Customizacao
- Dados Locais e Privacidade
- Como Usar
- Configuracoes
- Backup completo

Futuro:

- Meus Desenhos
- Meus Brushes
- Meus Cursos
- Meus Projetos
- Minhas Notas
- Minhas Aulas
- Minhas Colecoes
- Temas avancados
- Plugins em futuro distante

## Contribuicao futura

O projeto aceitara contribuicoes de codigo, documentacao, temas, traducoes, guias de estudo e recomendacoes de materiais, sempre respeitando as sprints, a politica de conteudo e as decisoes arquiteturais.

## Conteudo e PDFs

OpenArtDesk nao distribui PDFs comerciais pirateados, livros protegidos sem autorizacao ou materiais sem licenca clara. O usuario podera importar seus proprios arquivos locais sob sua propria responsabilidade.

## Documentos principais

- [Guia para Codex](AGENTS.md)
- [Visao do Produto](docs/project/PRODUCT_VISION.md)
- [Decisoes](docs/project/DECISIONS.md)
- [Roadmap](docs/project/ROADMAP.md)
- [Sprints](docs/project/SPRINTS.md)
- [Arquitetura](docs/project/ARCHITECTURE.md)
- [Politica de Conteudo](docs/policies/CONTENT_POLICY.md)

## Em breve

As proximas sprints devem consolidar arquitetura modular, rotas e preferencias locais antes de funcionalidades de dominio.
