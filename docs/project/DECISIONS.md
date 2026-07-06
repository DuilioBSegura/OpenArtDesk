# Registro de Decisoes

Status possiveis: Approved, Deferred, Rejected.

| ID | Decisao | Motivo | Status | Data aproximada |
| --- | --- | --- | --- | --- |
| D-001 | O produto sera desktop desde o inicio. | Evitar tratar o projeto como web app convertida. | Approved | 2026-07 |
| D-002 | Usar Tauri 2 em vez de Electron. | Menor footprint e melhor alinhamento com desktop leve. | Approved | 2026-07 |
| D-003 | Priorizar Windows primeiro. | Primeiro publico e primeiro build instalavel serao Windows. | Approved | 2026-07 |
| D-004 | Manter Linux importante no roadmap. | Coerencia com inspiracao em apps Linux modernos e comunidade open source. | Approved | 2026-07 |
| D-005 | Usar React, Vite e TypeScript no frontend. | Stack produtiva, tipada e comum para UI moderna. | Approved | 2026-07 |
| D-006 | Usar Tailwind CSS no app desktop. | Facilitar design system customizavel e consistente. | Approved | 2026-07 |
| D-007 | Bootstrap nao sera usado no app desktop. | Evitar visual generico de site/admin e preservar sensacao desktop. | Approved | 2026-07 |
| D-008 | Bootstrap pode ser referencia apenas para o site futuro. | Site Como Instalar pode ter visual de landing/documentacao. | Approved | 2026-07 |
| D-009 | Usar SQLite para dados estruturados. | Metadados, tags, estudos e registros precisam de consultas e evolucao. | Approved | 2026-07 |
| D-010 | Usar JSON local para preferencias visuais e interface. | Preferencias devem ser simples, portaveis e editaveis. | Approved | 2026-07 |
| D-011 | Usar filesystem local para arquivos grandes. | PDFs, imagens, videos e brushes nao devem ir para SQLite. | Approved | 2026-07 |
| D-012 | PDFs importados serao copiados para pasta interna do app. | Aumentar previsibilidade, backup e portabilidade. | Approved | 2026-07 |
| D-013 | Nao havera login obrigatorio no MVP. | Preservar local-first e baixa friccao. | Approved | 2026-07 |
| D-014 | Nao havera sync em nuvem no MVP. | Evitar dependencia de servidor e complexidade precoce. | Approved | 2026-07 |
| D-015 | Nao havera IA no MVP. | Manter foco em organizacao local e escopo controlado. | Approved | 2026-07 |
| D-016 | Nao havera plugins no MVP. | Plugins exigem sistema de extensao e seguranca maduros. | Approved | 2026-07 |
| D-017 | Nao havera leitor PDF embutido no MVP. | PDFs serao abertos no leitor padrao do sistema inicialmente. | Approved | 2026-07 |
| D-018 | Backup completo deve existir desde o MVP. | Usuario precisa liberdade e protecao dos proprios dados. | Approved | 2026-07 |
| D-019 | Site Como Instalar vira apos o primeiro build instalavel. | O site precisa documentar um fluxo real de instalacao. | Approved | 2026-07 |
| D-020 | Licenca definitiva ainda esta pendente. | Deve ser definida antes de contribuicoes publicas. | Deferred | 2026-07 |
| D-021 | Sprint 1 cria a base desktop na raiz do repositorio. | Manter docs e codigo no mesmo repositorio facilita validacao e continuidade. | Approved | 2026-07 |
| D-022 | Usar Tailwind CSS v4 com `@tailwindcss/vite` no Vite. | Integracao oficial da versao atual e configuracao simples para a base desktop. | Approved | 2026-07 |
| D-023 | Centralizar rotas a partir do module registry. | Evitar rotas espalhadas e permitir novas abas com baixo atrito. | Approved | 2026-07 |
| D-024 | Usar CSS variables como fonte principal de design tokens. | Permite temas, densidade e cores de destaque sem acoplar a UI a persistencia ou bibliotecas externas. | Approved | 2026-07 |
| D-025 | Persistir preferencias por Tauri/Rust em `preferences.json` no diretorio de configuracao do app. | Mantem preferencias locais, evita localStorage e impede caminhos hardcoded na UI. | Approved | 2026-07 |
