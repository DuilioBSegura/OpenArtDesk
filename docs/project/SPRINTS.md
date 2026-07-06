# Plano de Micro-sprints

Cada sprint deve ter um objetivo unico, fora de escopo explicito, criterios de aceite e validacao adequada.

## Sprint 0 - Fundacao Documental

Objetivo: criar documentacao, metodologia, politicas e agentes.

Fora de escopo: codigo funcional, Tauri, React, SQLite, dependencias, build e telas.

Criterios de aceite: todos os arquivos Markdown base existem, sao coerentes e orientam futuras sprints.

Comandos de validacao: listar arquivos Markdown e revisar conteudo.

Observacoes para Codex: nao implementar nada alem de documentacao.

## Sprint 1 - Bootstrap Desktop Tauri

Status: Concluida em 2026-07-06.

Objetivo: inicializar o app desktop com Tauri 2, React, Vite e TypeScript.

Fora de escopo: features de dominio, SQLite e biblioteca.

Criterios de aceite: app abre como desktop e comandos basicos de validacao passam.

Comandos de validacao:

- `npm run build`
- `npm run tauri dev`

Observacoes para Codex: nao executar `npm install` sem necessidade; a base atual ainda nao deve implementar dados reais, SQLite, upload de PDF, backup, IA, plugins ou leitor PDF.

Resultado: base Tauri 2 + React + Vite + TypeScript criada na raiz do repositorio, Tailwind CSS v4 integrado ao Vite, layout desktop inicial criado, sidebar renderizada por `moduleRegistry`, placeholders acessiveis criados e validacao executada com `npm run build` e `npm run tauri dev`.

## Sprint 2 - Arquitetura Modular e Rotas

Status: Concluida em 2026-07-06.

Objetivo: criar base de modulos, rotas e module registry.

Fora de escopo: implementar modulos completos.

Criterios de aceite: navegacao modular existe e novas abas podem ser registradas sem alterar varios pontos.

Comandos de validacao:

- `npm run build`
- `npm run tauri dev`

Observacoes para Codex: evitar sidebar hardcoded.

Resultado: module registry tipado com `enabled`, `order`, `group` e `description`; rotas centralizadas em `src/app/routes.ts`; sidebar renderizada por rotas derivadas do registry; placeholders padronizados com `PageScaffold`, `ModulePlaceholder` e `EmptyModulePage`; AppShell separado entre sidebar, topbar e main content.

## Sprint 3 - Customizacao Visual Inicial

Status: Concluida em 2026-07-06.

Objetivo: criar base visual, tokens e preferencias visuais iniciais.

Fora de escopo: persistencia em JSON, import/export de temas, marketplace, SQLite, upload de PDF, backup, IA, plugins e leitor PDF.

Criterios de aceite: app possui temas/densidade iniciais e visual desktop consistente.

Comandos de validacao:

- `npm run build`
- `npm run tauri dev`

Observacoes para Codex: nao usar Bootstrap no app desktop.

Resultado: sistema inicial de tema criado com CSS variables como fonte de tokens visuais; temas claro e escuro disponiveis; densidade confortavel/compacta e cor de destaque funcionam temporariamente em estado React; pagina Customizacao exibe controles e preview visual; componentes UI basicos adicionados em `src/components/ui`; AppShell, sidebar, topbar e area principal usam tokens visuais. Preferencias ainda nao sao persistidas.

## Sprint 4 - Preferencias Locais em JSON

Status: Concluida em 2026-07-06.

Objetivo: persistir preferencias locais em arquivo JSON.

Fora de escopo: dados de dominio, SQLite, upload de PDF, Minha Biblioteca funcional, backup completo, sync, IA, plugins, leitor PDF e site Como Instalar.

Criterios de aceite: preferencias sobrevivem ao reinicio e sao separadas dos dados estruturados.

Comandos de validacao:

- `npm run build`
- `cargo check`
- `npm run tauri dev`

Observacoes para Codex: validar caminhos e erros.

Resultado: modelo `AppPreferences` criado com `schemaVersion`, `appearance`, `onboarding` e `modules`; commands Tauri/Rust `get_app_preferences` e `save_app_preferences` criados; arquivo `preferences.json` salvo no diretorio local de configuracao do app via Tauri, sem caminho hardcoded; frontend carrega e salva preferencias por `invoke`; tema, densidade, cor de destaque e onboarding concluido sao restaurados apos reinicio; JSON ausente cria defaults e JSON invalido cai para defaults sem quebrar o app. Nenhum SQLite, localStorage, Bootstrap ou funcionalidade de dominio foi adicionado.

## Sprint 5 - SQLite e Camada de Dados

Objetivo: introduzir SQLite para dados estruturados.

Fora de escopo: arquivos grandes dentro do banco.

Criterios de aceite: migrations e repositories iniciais existem.

Comandos de validacao: testes de repositories e build.

Observacoes para Codex: planejar migracoes desde o inicio.

## Sprint 6 - Filesystem Local e Estrutura de Pastas Internas

Objetivo: definir pastas internas do app para arquivos importados.

Fora de escopo: leitor PDF embutido.

Criterios de aceite: caminhos internos sao criados e validados com seguranca.

Comandos de validacao: testes de filesystem e build.

Observacoes para Codex: nao expor caminhos desnecessarios.

## Sprint 7 - Minha Biblioteca v1

Objetivo: cadastrar e organizar PDFs e materiais locais.

Fora de escopo: anotacoes, leitor embutido e capas automaticas.

Criterios de aceite: usuario cadastra material, tags, categoria, status, observacoes e abre PDF no leitor padrao.

Comandos de validacao: testes, build e validacao manual.

Observacoes para Codex: respeitar politica de conteudo.

## Sprint 8 - Backup Completo v1

Objetivo: exportar dados, preferencias e arquivos internos.

Fora de escopo: sync automatico.

Criterios de aceite: backup inclui SQLite, JSON e filesystem interno.

Comandos de validacao: teste de exportacao e verificacao do arquivo.

Observacoes para Codex: documentar limitacoes.

## Sprint 9 - Estudos v1

Objetivo: criar organizacao basica de estudos.

Fora de escopo: planejamento avancado e automacoes.

Criterios de aceite: estudos podem ser criados, editados, categorizados e relacionados a materiais quando aplicavel.

Comandos de validacao: testes e build.

Observacoes para Codex: manter dominio simples.

## Sprint 10 - Atividades v1

Objetivo: registrar atividades de estudo.

Fora de escopo: sistema completo de produtividade.

Criterios de aceite: atividades possuem titulo, status e relacao opcional com estudos.

Comandos de validacao: testes e build.

Observacoes para Codex: evitar complexidade prematura.

## Sprint 11 - Referencias v1

Objetivo: organizar referencias locais e links.

Fora de escopo: scraping e downloads automaticos.

Criterios de aceite: referencias podem ser cadastradas com tags e fonte.

Comandos de validacao: testes e build.

Observacoes para Codex: exigir clareza de origem/licenca quando for conteudo contribuido.

## Sprint 12 - Dashboard v1

Objetivo: mostrar panorama local do usuario.

Fora de escopo: analytics remoto.

Criterios de aceite: dashboard mostra dados reais dos modulos implementados.

Comandos de validacao: testes, build e revisao visual.

Observacoes para Codex: nao criar metricas decorativas.

## Sprint 13 - Dados Locais e Privacidade

Objetivo: explicar e expor controles de dados locais.

Fora de escopo: contas online e sync.

Criterios de aceite: usuario entende onde os dados ficam, como exportar e quais limites existem.

Comandos de validacao: build e revisao de texto.

Observacoes para Codex: privacidade deve ser explicita.

## Sprint 14 - Build .exe Windows

Objetivo: gerar primeiro build instalavel Windows.

Fora de escopo: Linux e macOS.

Criterios de aceite: .exe gerado, instalado e validado em Windows.

Comandos de validacao: build Tauri e teste manual de instalacao.

Observacoes para Codex: preparar release notes.

## Sprint 15 - Site Como Instalar

Objetivo: criar site publico de instalacao e guias.

Fora de escopo: criar site antes de existir build real.

Criterios de aceite: site documenta instalacao real, politicas e contribuicao.

Comandos de validacao: build do site e revisao de links.

Observacoes para Codex: Bootstrap pode ser referencia visual apenas aqui.
