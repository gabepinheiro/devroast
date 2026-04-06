# Code Editor com Syntax Highlighting

> Spec criada em 2026-04-06 | Status: **Em revisao**

## Contexto

O DevRoast possui atualmente um `CodeEditor` (`src/components/code-editor.tsx`) que e um `<textarea>` simples sem syntax highlighting. O projeto ja usa **Shiki v4** para o componente read-only `CodeBlock`. O objetivo e transformar o editor da homepage em um editor com syntax highlighting e deteccao automatica de linguagem.

---

## Pesquisa: Como o ray-so faz

O [ray-so](https://github.com/raycast/ray-so) usa uma abordagem **textarea overlay** — nao usa CodeMirror, Monaco ou qualquer lib de editor:

| Aspecto | Implementacao ray-so |
|---|---|
| **Editor** | `<textarea>` com texto transparente (`-webkit-text-fill-color: transparent`) sobreposto a um `<div>` com HTML highlight |
| **Syntax Highlight** | **Shiki** — `codeToHtml()` gera o HTML colorido, renderizado com `dangerouslySetInnerHTML` |
| **Deteccao de linguagem** | **highlight.js** (`hljs.highlightAuto()`) — usado APENAS para auto-detect, nao para renderizacao |
| **Linguagem manual** | Dropdown com combobox onde o usuario pode selecionar/buscar a linguagem |
| **State management** | Jotai atoms |
| **Temas** | CSS custom properties mapeadas para tokens do Shiki — troca de tema instantanea sem re-highlight |
| **Grammars** | Lazy-loaded via dynamic imports (`import("shiki/langs/python.mjs")`) |
| **Keyboard handling** | Custom: Tab (indent/dedent), Enter (auto-indent), bracket closing via `document.execCommand("insertText")` |

### Pontos fortes do approach ray-so
- Leve (sem dependencia de editor pesado)
- Shiki produz highlight de alta qualidade (mesmos grammars do VS Code / TextMate)
- Ja usamos Shiki no projeto, entao e consistente
- Controle total sobre styling e UX

### Pontos fracos
- `document.execCommand` e deprecated (ainda funciona, mas sem garantia futura)
- Sem features avancadas: autocomplete, go-to-definition, multi-cursor, etc.
- Sincronizacao de scroll entre textarea e div pode ter edge cases

---

## Opcoes Avaliadas

### Opcao 1: Textarea Overlay + Shiki (approach ray-so) — **RECOMENDADA**

**Como funciona:** Um `<textarea>` invisivel (texto transparente) e posicionado exatamente sobre um `<div>` que renderiza o HTML gerado pelo Shiki. O usuario digita no textarea, mas ve o output colorido do div abaixo.

**Pros:**
- Consistente com o Shiki v4 que ja usamos (`CodeBlock`)
- Bundle size minimo (ja temos Shiki, so adicionamos highlight.js para auto-detect ~45KB gzip)
- Controle total sobre a UX e styling
- Approach validado em producao pelo ray-so
- Nao precisa de framework de editor complexo

**Contras:**
- Precisamos implementar features basicas manualmente (Tab, auto-indent)
- `document.execCommand` e deprecated
- Sincronizacao de scroll textarea/div precisa de cuidado

**Ideal para o DevRoast porque:** O editor e apenas para colar/digitar codigo para ser "roasted". Nao precisamos de IDE features — precisamos de boa aparencia e syntax highlighting confiavel.

### Opcao 2: CodeMirror 6

**Como funciona:** Editor completo com sistema de extensoes. Usa seu proprio parser (Lezer) para highlighting.

**Pros:**
- Editor maduro e battle-tested
- Acessibilidade excelente (ARIA, screen readers)
- Extensoes para quase tudo
- API moderna e modular

**Contras:**
- Bundle size significativo (~150-250KB gzip dependendo das extensoes)
- Sistema de temas proprio — precisariamos adaptar nosso design system
- Highlighting usa Lezer (diferente do Shiki/TextMate) — resultado visual pode diferir do `CodeBlock`
- Overpowered para o nosso caso de uso
- Complexidade de integracao maior

### Opcao 3: Monaco Editor (editor do VS Code)

**Pros:**
- Feature-complete (e literalmente o VS Code)
- Usa TextMate grammars (mesmo que Shiki)

**Contras:**
- Bundle size enorme (~2-4MB)
- Difícil de customizar visualmente
- Carrega web workers separados
- Extremamente overpowered para paste-and-roast
- Problemas conhecidos com SSR/Next.js

**Descartada** — muito pesado para o caso de uso.

### Opcao 4: Shiki + `@shikijs/monaco` ou `shiki-magic-move`

O ecossistema Shiki tem packages experimentais, mas sao focados em display, nao em edicao. Nao resolvem o problema do editor.

---

## Decisao: Opcao 1 — Textarea Overlay + Shiki

A Opcao 1 e a mais alinhada com o projeto:
1. **Ja usamos Shiki** — consistencia visual garantida com o `CodeBlock`
2. **Caso de uso simples** — o usuario cola codigo, opcionalmente edita, e clica "Roast"
3. **Performance** — sem overhead de editor pesado
4. **Controle** — podemos estilizar exatamente como queremos

---

## Especificacao Tecnica

### Arquitetura do componente

```
CodeEditor (refatorado)
├── <textarea>           -- input real, texto transparente, z-index superior
├── <HighlightedOverlay> -- div com HTML do Shiki, z-index inferior
├── <LineNumbers>        -- numeracao de linhas (ja existe parcialmente)
└── <LanguageSelector>   -- dropdown para selecao manual de linguagem
```

### Deteccao automatica de linguagem

- Usar `highlight.js` (`hljs.highlightAuto()`) apenas para deteccao (mesmo approach do ray-so)
- Executar deteccao com debounce (~300ms) apos o usuario parar de digitar
- Exibir linguagem detectada com indicador "(auto)" no seletor
- Quando o usuario seleciona manualmente, desabilitar auto-detect

### Syntax Highlighting

- Usar `shiki` (ja instalado v4) com `codeToHtml()`
- Tema: `vesper` (ja usado no `CodeBlock`) ou mapear para CSS variables para flexibilidade futura
- Lazy-load de grammars por linguagem para reduzir bundle inicial
- Re-highlight com debounce junto com a deteccao de linguagem

### Sincronizacao textarea/overlay

- Ambos no mesmo grid cell (`grid-area: 1/1`)
- Textarea: `background: transparent`, `-webkit-text-fill-color: transparent`, `caret-color: visible`
- Fontes, padding, line-height identicos entre textarea e div
- Scroll sincronizado via `onScroll` event no textarea aplicado ao div

### Keyboard handling

- **Tab**: inserir 2 espacos (ou dedent com Shift+Tab)
- **Enter**: manter indentacao da linha anterior
- Usar `document.execCommand("insertText")` com fallback para `setRangeText()` caso `execCommand` seja removido no futuro
- Bracket auto-close: avaliar necessidade (pode ser scope futuro)

### Seletor de linguagem

- Dropdown/combobox com busca (pesquisavel por nome)
- Posicao: **Select no canto direito da toolbar** do editor
- Lista de linguagens suportadas: comecar com as mais populares (~20-30)
- Mostrar "(auto)" quando a linguagem foi detectada automaticamente
- Ao selecionar manualmente, manter a selecao ate o usuario limpar o editor

### Limite de tamanho

- Maximo de **2000 linhas**
- Ao atingir o limite, bloquear novos inputs (impedir digitacao/paste que ultrapasse)
- Exibir indicador visual informando o limite (ex: "2000/2000 linhas")
- Considerar um contador de linhas visivel no editor (ex: rodape ou junto a toolbar)

### Linguagens iniciais suportadas

JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Dart, HTML, CSS, SQL, Shell/Bash, JSON, YAML, Markdown, Lua, R, Scala, Elixir

---

## Decisoes (respondidas)

1. **Seletor de linguagem:** Select no canto direito da toolbar do editor.
2. **Edicao real:** Sim, o usuario tambem escreve codigo. Implementar Tab, Shift+Tab, auto-indent no Enter.
3. **Roast Mode toggle:** Afeta somente o backend. Nao muda comportamento do editor.
4. **Mobile:** Nao e prioridade, mas deve funcionar. Foco no desktop, mobile como best-effort.
5. **Limite de codigo:** Maximo de **2000 linhas**. Bloquear input alem disso e exibir mensagem ao usuario.

---

## TODOs de Implementacao

- [ ] Instalar `highlight.js` como dependencia (apenas o core + deteccao)
- [ ] Refatorar `CodeEditor` para arquitetura textarea overlay
  - [ ] Textarea com texto transparente (z-index superior)
  - [ ] Div com HTML Shiki (z-index inferior)
  - [ ] Sincronizacao de scroll
  - [ ] Garantir fontes/padding/line-height identicos
- [ ] Implementar `HighlightedOverlay` usando Shiki `codeToHtml()`
  - [ ] Debounce no re-highlight (~300ms)
  - [ ] Lazy-load de grammars por linguagem
  - [ ] Usar tema `vesper` (consistente com `CodeBlock`)
- [ ] Implementar deteccao automatica de linguagem
  - [ ] Setup do `hljs.highlightAuto()` com subset de linguagens
  - [ ] Debounce na deteccao (~300ms, pode compartilhar com highlight)
  - [ ] State: `detectedLanguage` vs `userSelectedLanguage`
- [ ] Criar componente `LanguageSelector`
  - [ ] Combobox pesquisavel com lista de linguagens
  - [ ] Indicador "(auto)" quando linguagem e auto-detectada
  - [ ] Integrar com Base UI (ja usado no projeto)
- [ ] Keyboard handling
  - [ ] Tab para indentacao (2 espacos)
  - [ ] Shift+Tab para dedent
  - [ ] Enter com auto-indent
  - [ ] Fallback para `setRangeText()` se `execCommand` falhar
- [ ] Implementar limite de 2000 linhas
  - [ ] Bloquear input alem do limite
  - [ ] Exibir indicador visual de linhas (ex: "123/2000")
  - [ ] Truncar paste que ultrapasse o limite
- [ ] Integrar com `CodeSection` existente
  - [ ] Passar linguagem detectada/selecionada para o parent
  - [ ] Manter compatibilidade com o botao "Roast" e toggle existentes
- [ ] Testes manuais
  - [ ] Colar codigo em diversas linguagens e verificar deteccao
  - [ ] Testar scroll com codigo longo
  - [ ] Testar em mobile
  - [ ] Testar troca de linguagem manual vs auto
- [ ] Performance
  - [ ] Verificar que re-highlight com debounce nao causa jank
  - [ ] Medir bundle size adicionado pelo highlight.js core
  - [ ] Considerar Web Worker para highlight se necessario
