# 🍎 School Snack Planner

Aplicação web que monta o lanche escolar da semana (segunda a sexta) a partir dos
alimentos disponíveis em casa. Implementa o [PRD](prd.md).

Roda **100% no navegador**: sem backend, banco de dados, login ou API de IA.
Nenhuma informação sobre a criança ou os alimentos sai do dispositivo.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script              | O que faz                                    |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | ambiente de desenvolvimento                  |
| `npm run build`     | site estático em `out/` (deploy sem servidor) |
| `npm test`          | testes das regras de domínio                 |
| `npm run typecheck` | checagem de tipos                            |
| `npm run lint`      | ESLint                                       |

## Regra do lanche

Cada dia tem **exatamente 2 frutas diferentes + 1 salgado OU doce**. Sem exceção.

O planejamento é **determinístico**: a mesma lista de alimentos sempre gera a
mesma semana. As regras não dependem da interpretação de um modelo de IA.

- frutas: nunca iguais no mesmo dia, duplas não se repetem antes de esgotar as
  demais e o uso é equilibrado entre as frutas informadas;
- acompanhamentos: alternam salgado e doce quando possível e nunca repetem em
  dias consecutivos se houver alternativa;
- quando pão e queijo (ou outras combinações conhecidas) estão disponíveis, eles
  contam como **um** acompanhamento: "Pão com queijo".

## Arquitetura

A lógica de negócio fica fora dos componentes React:

```
src/
├── app/                  # rota única, estática
├── components/           # Chat, FoodInput, UnknownFood, WeeklyPlan, SnackCard, Suggestions
├── domain/               # tipos e regras: food, snack, plannerState (máquina de estados), messages
├── services/             # foodParser, foodClassifier, snackPlanner, suggestionEngine, pdfGenerator
└── data/                 # foods (catálogo + combinações), suggestions
```

O estado vive só em memória (`useReducer` sobre `plannerReducer`). Recarregar a
página zera tudo — é o comportamento previsto no PRD §20.

## Como estender

**Novo alimento**: uma linha em [`src/data/foods.ts`](src/data/foods.ts).

```ts
{ name: "Melão", category: "fruit", emoji: "🍈", aliases: ["melao"] }
```

`aliases` cobre variações regionais e erros de digitação — a busca já ignora
acentos e maiúsculas. `refrigerationRecommended: true` faz o item entrar no aviso
de lancheira térmica.

**Nova combinação** (dois itens que valem como um acompanhamento): `FOOD_COMBOS`,
no mesmo arquivo. Frutas nunca são consumidas por combinações.

**Nova sugestão**: [`src/data/suggestions.ts`](src/data/suggestions.ts), com
`region` (`northeast` prioriza) e o motivo exibido ao usuário.

Idade e localização ainda não são configuráveis, mas nada no domínio depende
delas — a evolução prevista no PRD §5 não exige reescrever as regras.

## Deploy

`npm run build` gera `out/`, uma pasta estática que pode ser servida por
qualquer hospedagem (Vercel, Netlify, GitHub Pages, S3).
