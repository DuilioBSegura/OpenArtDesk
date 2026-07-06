# Arquitetura Conceitual

OpenArtDesk deve ser um aplicativo desktop modular com separacao clara entre UI, comandos locais, servicos, dados estruturados e arquivos.

## Camadas

1. Frontend React
2. Tauri Commands
3. Rust Services
4. SQLite Repositories
5. Local File System

## Responsabilidades

Frontend React: renderiza a interface, organiza rotas, componentes, hooks e interacoes do usuario.

Tauri Commands: expone operacoes locais ao frontend com contratos controlados.

Rust Services: executam regras de aplicacao local, validam caminhos, coordenam storage e filesystem.

SQLite Repositories: persistem dados estruturados e metadados.

Local File System: guarda PDFs, imagens, videos, brushes e arquivos grandes.

## Preferencias vs dados de dominio

Preferencias de UI devem ficar em JSON local:

- tema ativo;
- densidade;
- layout;
- modulos visiveis;
- wallpapers;
- escolhas de interface.

Dados de dominio devem ficar em SQLite:

- materiais;
- tags;
- categorias;
- estudos;
- atividades;
- referencias;
- status;
- observacoes;
- relacoes entre entidades.

Arquivos grandes devem ficar no filesystem local, referenciados pelo SQLite quando necessario.

## Estrutura modular

Cada feature deve ter fronteiras claras de dominio, UI, storage e integracao. O app deve usar um module registry para registrar abas, rotas, icones, labels e permissoes futuras.

Modulos futuros devem poder ser adicionados sem reescrever a navegacao principal.

## Module Registry e rotas

O frontend usa `src/modules/moduleRegistry.ts` como fonte de verdade para modulos. Cada modulo ativo possui:

- `id`
- `label`
- `path`
- `icon`
- `enabled`
- `order`
- `group`
- `description`
- `component`

As rotas internas sao centralizadas em `src/app/routes.ts` e derivadas dos modulos habilitados. A sidebar recebe essas rotas e nao declara abas manualmente. Modulos desabilitados nao aparecem na navegacao.

O registry tambem mantem blueprints de modulos futuros, como Meus Desenhos, Meus Brushes e Meus Cursos, sem expor essas abas no app e sem implementar funcionalidades de dominio.

## Paginas placeholder

Paginas vazias usam componentes reutilizaveis:

- `PageScaffold`
- `ModulePlaceholder`
- `EmptyModulePage`

Essa estrutura padroniza titulo, descricao e area de conteudo sem criar dados reais, storage ou funcionalidades fora da sprint.

## Design system, customizacao visual e preferencias

O frontend usa CSS variables como fonte principal para tokens visuais. Os tokens cobrem background, foreground, surfaces, borders, muted, accent, danger, warning, success, radius e densidade. O AppShell aplica `data-theme`, `data-density` e `data-accent` para alternancia visual temporaria em runtime.

A partir da Sprint 4, preferencias visuais e de interface sao persistidas em JSON local por commands Tauri/Rust. O frontend usa `src/features/preferences` para tipos, defaults, carregamento, salvamento e aplicacao das preferencias no AppShell.

O arquivo local de preferencias usa schema versionado e contem:

- `schemaVersion`
- `appearance.theme`
- `appearance.density`
- `appearance.accentColor`
- `onboarding.completed`
- `modules.hiddenModuleIds`
- `modules.moduleOrder`

Os commands Rust `get_app_preferences` e `save_app_preferences` usam o diretorio de configuracao do app resolvido pelo Tauri e salvam `preferences.json`. A UI nao envia caminhos ao Rust, nao usa `localStorage` e nao acessa o filesystem diretamente. Se o arquivo estiver ausente, defaults seguros sao criados. Se estiver invalido, o app usa defaults sem quebrar.

Componentes UI basicos ficam em `src/components/ui` e devem permanecer pequenos, reutilizaveis e orientados ao uso real do app desktop. A pagina Customizacao consome esses componentes para alterar preferencias visuais e salvar o resultado via camada de preferencias.

## Futuras abas

- Minha Biblioteca
- Estudos
- Referencias
- Atividades
- Meus Desenhos
- Meus Brushes
- Meus Cursos
- Meus Projetos
- Minhas Notas
- Minhas Aulas
- Minhas Colecoes

## Estrutura inicial

```text
src/
src/app/
src/components/
src/components/feedback/
src/components/layout/
src/components/ui/
src/features/
src/lib/
src/modules/
src/styles/
src/types/
src-tauri/
src-tauri/src/preferences.rs
docs/
docs/project/
docs/agents/
docs/policies/
```

O frontend inicial usa `src/modules/moduleRegistry.ts` para registrar modulos e `src/app/routes.ts` para derivar rotas de navegacao. As paginas atuais sao placeholders visuais, com persistencia apenas para preferencias de interface. Ainda nao ha persistencia de dados de dominio.

## Anti-patterns proibidos

- Regra de storage dentro de componente React.
- UI chamando filesystem diretamente sem camada controlada.
- Sidebar hardcoded sem module registry.
- PDFs guardados dentro do SQLite.
- Preferencias visuais misturadas com dados de dominio sem motivo.
- Bootstrap no app desktop.
- Funcionalidades futuras implementadas fora da sprint.
- Telemetria ou envio de dados sem consentimento explicito.
