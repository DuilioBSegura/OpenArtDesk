# Backlog por Epicos

## Base Desktop

Objetivo: criar a fundacao Tauri/React do app.

Features: projeto Tauri, janela inicial, scripts, validacao de build.

Prioridade inicial: Alta.

Observacoes: so comecar apos Sprint 0.

Riscos: tratar como web app em vez de desktop.

## Arquitetura Modular

Objetivo: permitir novas abas e modulos sem acoplamento excessivo.

Features: module registry, rotas, contratos de modulo, organizacao de pastas.

Prioridade inicial: Alta.

Observacoes: deve guiar todos os modulos.

Riscos: sidebar hardcoded e logica espalhada.

## Customizacao

Objetivo: tornar customizacao parte central do produto.

Features: temas prontos, densidade, layout, aparencia de cards, wallpapers.

Prioridade inicial: Alta.

Observacoes: iniciar simples, com caminho de evolucao.

Riscos: virar detalhe cosmetico ou complexidade precoce.

## Preferencias Locais

Objetivo: salvar preferencias de UI em JSON local.

Features: tema ativo, densidade, layout, modulos visiveis.

Prioridade inicial: Alta.

Observacoes: separar de dados de dominio.

Riscos: misturar preferencias com registros do usuario.

## Armazenamento Local

Objetivo: estruturar SQLite e filesystem interno.

Features: migrations, repositories, pastas internas, validacao de caminhos.

Prioridade inicial: Alta.

Observacoes: PDFs e arquivos grandes ficam no filesystem.

Riscos: guardar arquivos grandes no banco ou sem backup.

## Minha Biblioteca

Objetivo: organizar PDFs e materiais locais.

Features: cadastro, copia interna, tags, categorias, status, capa, observacoes.

Prioridade inicial: Alta.

Observacoes: abrir PDF no leitor padrao.

Riscos: prometer leitor embutido cedo demais.

## Estudos

Objetivo: organizar planos e registros de estudo.

Features: cadastro de estudos, status, notas, relacao com materiais.

Prioridade inicial: Media.

Observacoes: deve conversar com biblioteca e dashboard.

Riscos: virar gerenciador generico demais.

## Atividades

Objetivo: controlar atividades praticas e tarefas.

Features: atividades, status, prazos opcionais, relacao com estudos.

Prioridade inicial: Media.

Observacoes: simples no MVP.

Riscos: virar sistema de produtividade complexo.

## Referencias

Objetivo: organizar referencias visuais e materiais de apoio.

Features: cadastro, tags, categorias, links, arquivos locais.

Prioridade inicial: Media.

Observacoes: respeitar politica de conteudo.

Riscos: aceitar materiais sem licenca clara.

## Dashboard

Objetivo: mostrar panorama local dos estudos.

Features: resumos, atalhos, recentes, progresso basico.

Prioridade inicial: Media.

Observacoes: deve refletir dados reais.

Riscos: dashboard vazio ou decorativo.

## Backup e Portabilidade

Objetivo: permitir exportar tudo desde o MVP.

Features: backup completo, manifest, documentacao de restauracao.

Prioridade inicial: Alta.

Observacoes: arquivo final pode ser grande.

Riscos: backup incompleto ou sem arquivos internos.

## Dados Locais e Privacidade

Objetivo: deixar claro onde os dados ficam e como sao protegidos.

Features: pagina de privacidade local, politicas, avisos de consentimento.

Prioridade inicial: Alta.

Observacoes: sem telemetria escondida.

Riscos: ambiguidade sobre coleta de dados.

## Como Usar

Objetivo: orientar usuario dentro do app.

Features: guia inicial, ajuda contextual, documentacao basica.

Prioridade inicial: Media.

Observacoes: sem telas excessivamente explicativas.

Riscos: documentacao ficar desatualizada.

## Build e Release

Objetivo: gerar artefatos instalaveis.

Features: build Windows, release notes, changelog, validacao.

Prioridade inicial: Alta antes do site.

Observacoes: primeiro alvo e .exe simples.

Riscos: release sem teste ou sem instrucoes.

## Site Como Instalar

Objetivo: publicar guia externo de instalacao e contribuicao.

Features: home, Windows, Linux, FAQ, politicas, releases.

Prioridade inicial: Depois do primeiro build.

Observacoes: Bootstrap pode servir como referencia visual aqui.

Riscos: site prometer instalacao que ainda nao existe.

## Comunidade/Open Source

Objetivo: preparar colaboracao saudavel.

Features: contributing, code of conduct, licenca, politicas, issues.

Prioridade inicial: Alta.

Observacoes: licenca precisa ser decidida antes de contribuicoes publicas.

Riscos: aceitar contribuicoes sem base legal clara.

