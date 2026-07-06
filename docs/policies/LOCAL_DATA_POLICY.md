# Politica de Dados Locais

OpenArtDesk e local-first e offline-first. O app deve funcionar sem servidor obrigatorio, sem login obrigatorio e sem internet para as funcoes principais do MVP.

## Onde os dados devem ficar futuramente

- SQLite: dados estruturados, metadados, tags, categorias, estudos, atividades, biblioteca e referencias.
- JSON local: preferencias visuais e de interface.
- Filesystem local: PDFs, imagens, videos, brushes e arquivos grandes.

## Preferencias locais atuais

A partir da Sprint 4, o app salva preferencias de interface em `preferences.json` no diretorio de configuracao local resolvido pelo Tauri. Esse arquivo inclui tema, densidade, cor de destaque, estado de onboarding e preparacao para preferencias de modulos.

O frontend nao usa `localStorage` para preferencias e nao define caminhos absolutos. O Rust/Tauri resolve o diretorio apropriado do app e retorna defaults seguros quando o arquivo esta ausente ou invalido.

## Offline por padrao

O app deve abrir e operar localmente. Funcionalidades online futuras, se existirem, devem ser opcionais e opt-in.

## Sem servidor obrigatorio

O MVP nao deve depender de backend remoto, conta online, sync em nuvem ou autenticacao.

## Risco de perda de dados

Se o usuario apagar a pasta de dados do app ou arquivos internos importados, podera perder informacoes. Por isso, backup completo e parte essencial do MVP.

## Backup

O backup deve considerar banco SQLite, preferencias JSON e arquivos armazenados na pasta interna do app. O arquivo final pode ser grande.
