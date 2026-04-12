# Specs

Antes de implementar uma feature não trivial, crie uma spec neste diretório e alinhe com o usuário antes de codar.

## Arquivo

- Nome: `kebab-case.md` descritivo da feature (ex: `code-editor-syntax-highlight.md`).
- Idioma: português, com acentos.

## Estrutura

```markdown
# Título da Feature

> Spec criada em YYYY-MM-DD | Status: **Rascunho** | **Em revisão** | **Aprovada**

## Contexto
Estado atual, o problema e o objetivo. Curto.

## Opções Avaliadas  (quando houver tradeoff de abordagem)
Uma subseção por opção com prós, contras e bundle/complexidade quando relevante.

## Decisão  (quando houver Opções Avaliadas)
Qual opção foi escolhida e por que.

## Especificação Técnica
Arquitetura, schema, contratos, comportamento esperado. Use tabelas e snippets
de código quando ajudar.

## TODOs de Implementação
- [ ] Lista de checkboxes cobrindo o trabalho
```

Separe seções grandes com `---`. Omita seções que não se aplicam — nem toda spec precisa de "Opcoes Avaliadas".

## Fluxo

1. Criar a spec e pedir revisão do usuario.
2. Ajustar conforme feedback ate o Status virar **Aprovada**.
3. So então começar a implementação, seguindo os TODOs.
4. Atualizar a spec se decisoes mudarem durante a implementação.
