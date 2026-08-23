# PRD — School Snack Planner

**Versão:** 1.0
**Status:** Draft
**Plataforma:** Web
**Público inicial:** Pais e responsáveis por crianças em idade escolar

---

## 1. Visão Geral

O **School Snack Planner** é uma aplicação web simples para ajudar pais e responsáveis a montar o lanche escolar semanal de uma criança a partir dos alimentos disponíveis em casa.

A experiência deve lembrar uma conversa com um assistente: o usuário informa os alimentos disponíveis e a aplicação monta automaticamente um planejamento de segunda a sexta-feira.

O produto será executado **100% no navegador**, sem backend, banco de dados, autenticação ou integração com serviços de IA.

O planejamento poderá ser exportado em PDF.

---

## 2. Objetivo

Permitir que um responsável monte, em poucos segundos, um planejamento semanal de lanches que:

* utilize os alimentos disponíveis;
* tenha variedade durante a semana;
* siga uma composição consistente;
* seja adequado para uma criança de 5 anos;
* considere o contexto de Fortaleza, Ceará;
* apresente sugestões saudáveis para semanas futuras;
* possa ser salvo como PDF.

---

## 3. Escopo do MVP

O MVP terá apenas dois estados principais:

### Estado 1 — Montagem

Interface em formato de conversa onde o sistema pergunta:

> Quais alimentos estão disponíveis para montar os lanches desta semana?
>
> Pode informar todas as opções disponíveis, incluindo frutas, salgados e doces.

O usuário informa os alimentos disponíveis.

### Estado 2 — Resultado

A aplicação:

1. classifica os alimentos;
2. valida se existem opções suficientes;
3. monta os cinco dias;
4. apresenta o planejamento;
5. apresenta sugestões adicionais;
6. permite exportação para PDF;
7. permite iniciar uma nova semana.

---

# 4. Fora do Escopo

Não fazem parte do MVP:

* Backend.
* Banco de dados.
* Login.
* Cadastro de usuário.
* Cadastro de criança.
* Histórico de planejamentos.
* Sincronização entre dispositivos.
* API da OpenAI.
* ChatGPT ou outro LLM.
* Conta de usuário.
* Notificações.
* Aplicativo mobile nativo.
* Persistência do planejamento após fechar a aplicação.

---

# 5. Público-alvo

Pais e responsáveis que precisam organizar lanches escolares de crianças pequenas.

### Contexto inicial

A primeira versão será otimizada considerando:

* criança de **5 anos**;
* residência em **Fortaleza, Ceará, Brasil**;
* clima tropical/quente;
* alimentos comuns no Brasil e Nordeste;
* transporte em lancheira escolar.

A arquitetura deve permitir que idade e localização se tornem configuráveis futuramente.

---

# 6. Experiência Principal

## 6.1 Tela inicial

A interface deve apresentar visual semelhante a um assistente conversacional.

### Header

```text
🍎 School Snack Planner

Monte o lanche da semana
```

### Mensagem inicial

```text
👋 Quais alimentos estão disponíveis para
montar os lanches desta semana?

Pode informar frutas, salgados e doces.
```

### Campo

```text
┌──────────────────────────────────────┐
│ Banana, laranja, pão, queijo...      │
└──────────────────────────────────────┘

                         [ Montar semana ]
```

O usuário poderá informar os alimentos separados por:

* vírgula;
* quebra de linha;
* ponto e vírgula.

---

# 7. Classificação dos Alimentos

Cada alimento precisa pertencer a uma das seguintes categorias:

```typescript
type FoodCategory =
  | "fruit"
  | "savory"
  | "sweet";
```

Exemplo:

```typescript
{
  name: "banana",
  category: "fruit"
}
```

A aplicação deverá possuir um catálogo local para reconhecer alimentos comuns.

Exemplo:

```typescript
const FOOD_CATALOG = {
  banana: "fruit",
  laranja: "fruit",
  kiwi: "fruit",
  tangerina: "fruit",
  manga: "fruit",
  caju: "fruit",

  pão: "savory",
  queijo: "savory",
  tapioca: "savory",
  cuscuz: "savory",
  "mini pizza": "savory",

  "bolinho de cenoura": "sweet",
  "bolinho de banana": "sweet",
  "panqueca de banana": "sweet"
};
```

O catálogo deverá ser facilmente expansível.

---

# 8. Alimento Não Reconhecido

A aplicação **não poderá assumir automaticamente uma categoria**.

Exemplo:

```text
Usuário:

banana, manga, pão e crepioca
```

Caso `crepioca` não exista no catálogo:

```text
🤔 Não reconheci "crepioca".

Como devemos classificá-la?

[ 🍎 Fruta ]
[ 🥪 Salgado ]
[ 🧁 Doce ]
```

Após a seleção, o processamento continua normalmente.

Essa classificação será válida somente para a execução atual.

---

# 9. Regra Principal do Lanche

Cada dia deverá possuir **exatamente**:

```text
2 frutas diferentes
+
1 salgado OU doce
```

Exemplo:

```text
Segunda-feira

🍌 Banana
🍊 Laranja
🥪 Pão com queijo
```

Nenhuma exceção deve violar essa regra.

---

# 10. Algoritmo de Planejamento

O planejamento deve gerar cinco dias:

```text
Segunda
Terça
Quarta
Quinta
Sexta
```

## 10.1 Frutas

O algoritmo deverá:

1. selecionar exatamente duas frutas por dia;
2. impedir duas frutas iguais no mesmo dia;
3. evitar repetir pares;
4. distribuir as frutas de maneira equilibrada;
5. maximizar variedade.

Exemplo com:

```text
banana
laranja
kiwi
tangerina
```

Possíveis combinações:

```text
banana + laranja
kiwi + tangerina
banana + kiwi
laranja + tangerina
banana + tangerina
```

---

# 11. Acompanhamentos

Os acompanhamentos podem ser:

```text
savory
sweet
```

A aplicação deverá, quando possível:

```text
Salgado
↓
Doce
↓
Salgado
↓
Doce
↓
Salgado
```

ou:

```text
Doce
↓
Salgado
↓
Doce
↓
Salgado
↓
Doce
```

Também deverá evitar repetir o mesmo acompanhamento em dias consecutivos.

Não é obrigatório consumir todas as opções fornecidas.

---

# 12. Quantidade Insuficiente

A aplicação deverá validar os alimentos antes da geração.

### Menos de duas frutas diferentes

Não gerar planejamento.

Exibir:

```text
🍎 Precisamos de pelo menos duas frutas
diferentes para montar os lanches.

Você informou:
• Banana

Adicione pelo menos mais uma fruta.
```

### Nenhum acompanhamento

Exibir:

```text
🥪 Está faltando um acompanhamento.

Adicione pelo menos uma opção salgada
ou doce.
```

O usuário poderá complementar a lista sem reiniciar.

---

# 13. Resultado

Após a geração, apresentar:

## 🍎 Lanche da semana

| Dia     | Fruta 1 | Fruta 2   | Salgado/Doce       |
| ------- | ------- | --------- | ------------------ |
| Segunda | Banana  | Laranja   | Pão com queijo     |
| Terça   | Kiwi    | Tangerina | Bolinho de cenoura |
| Quarta  | Banana  | Kiwi      | Mini pizza         |
| Quinta  | Laranja | Tangerina | Bolinho de banana  |
| Sexta   | Banana  | Tangerina | Panqueca de banana |

No mobile, a tabela poderá ser substituída por cards.

---

# 14. Cards Diários

A apresentação principal deverá priorizar cards em vez de uma tabela tradicional.

Exemplo:

```text
┌────────────────────────────┐
│ SEGUNDA                    │
│                            │
│ 🍌 Banana   🍊 Laranja     │
│                            │
│ 🥪 Pão com queijo          │
└────────────────────────────┘
```

Os cinco cards devem ser facilmente escaneáveis visualmente.

---

# 15. Sugestões Saudáveis

Depois do planejamento, apresentar:

## 💡 Sugestões para próximas semanas

A aplicação poderá selecionar até cinco opções do catálogo interno de sugestões.

Exemplo:

```text
🥭 Manga
Fácil de encontrar e ajuda a variar as frutas.

🍎 Caju
Fruta regional e adequada para variar o cardápio.

🌽 Cuscuz com queijo
Alternativa regional para os acompanhamentos.

🫓 Tapioca com queijo
Opção simples e prática.

🍉 Melancia
Fruta refrescante para o clima quente.
```

As sugestões:

* nunca entram automaticamente no planejamento;
* devem considerar os alimentos já disponíveis;
* devem evitar sugerir exatamente aquilo que o usuário já informou;
* devem priorizar alimentos frescos, regionais ou minimamente processados.

---

# 16. Base de Sugestões

O frontend deverá possuir uma base local.

Exemplo:

```typescript
const SUGGESTIONS = [
  {
    name: "Caju",
    category: "fruit",
    region: "northeast",
    reason: "Fruta regional e uma boa opção para variar."
  },
  {
    name: "Manga",
    category: "fruit",
    region: "brazil",
    reason: "Fruta prática e bastante acessível."
  },
  {
    name: "Tapioca com queijo",
    category: "savory",
    region: "northeast",
    reason: "Opção salgada simples e regional."
  }
];
```

---

# 17. Segurança Alimentar

Por se tratar de Fortaleza e de alimentos transportados para escola, alguns alimentos deverão possuir indicação de refrigeração.

Estrutura:

```typescript
{
  name: "queijo",
  category: "savory",
  refrigerationRecommended: true
}
```

Quando houver alimentos dessa categoria no planejamento, mostrar discretamente:

> ❄️ Alguns alimentos deste planejamento devem ser transportados em lancheira térmica para conservação adequada.

A mensagem não precisa aparecer em cada card.

---

# 18. Exportação para PDF

O usuário poderá selecionar:

```text
[ 📄 Exportar PDF ]
```

Todo processamento ocorrerá no navegador.

O PDF deverá conter:

```text
🍎 Lanche Escolar

Plano da Semana

────────────────────────

SEGUNDA
Banana • Laranja
Pão com queijo

TERÇA
Kiwi • Tangerina
Bolinho de cenoura

...

────────────────────────

💡 Sugestões para próximas semanas

Caju
Manga
Cuscuz com queijo

────────────────────────

❄️ Observação sobre conservação
```

O PDF deverá ser adequado para:

* impressão;
* envio por WhatsApp;
* compartilhamento;
* armazenamento pessoal.

---

# 19. Nova Semana

Após o resultado:

```text
[ 🔄 Montar nova semana ]
```

Ao selecionar a opção:

1. limpar alimentos;
2. limpar classificações temporárias;
3. limpar planejamento;
4. retornar à mensagem inicial.

Nenhum alimento da execução anterior deve ser automaticamente reaproveitado.

---

# 20. Estado da Aplicação

Todo o estado ficará no frontend.

Exemplo:

```typescript
interface PlannerState {
  foods: Food[];
  unknownFoods: string[];
  weeklyPlan: DaySnack[];
  suggestions: Suggestion[];
}
```

Não haverá persistência obrigatória.

Ao atualizar ou fechar a página, os dados podem ser perdidos.

---

# 21. Arquitetura

```text
School Snack Planner

        │
        ▼

     Next.js
        │
        ├── Chat UI
        │
        ├── Food Parser
        │
        ├── Food Classifier
        │
        ├── Snack Planner
        │
        ├── Suggestion Engine
        │
        └── PDF Generator
```

Tudo executado no navegador.

---

# 22. Stack Técnica

### Aplicação

```text
Next.js
React
TypeScript
```

### UI

```text
Tailwind CSS
Lucide Icons
```

### PDF

Preferencialmente:

```text
jsPDF
```

ou biblioteca equivalente que funcione inteiramente client-side.

### Deploy

Aplicação estática ou serverless sem backend próprio.

Pode ser hospedada gratuitamente em serviços compatíveis com aplicações Next.js estáticas.

---

# 23. Estrutura Sugerida

```text
src/
├── app/
│   └── page.tsx
│
├── components/
│   ├── Chat.tsx
│   ├── FoodInput.tsx
│   ├── UnknownFood.tsx
│   ├── WeeklyPlan.tsx
│   ├── SnackCard.tsx
│   └── Suggestions.tsx
│
├── domain/
│   ├── food.ts
│   └── snack.ts
│
├── services/
│   ├── foodClassifier.ts
│   ├── snackPlanner.ts
│   ├── suggestionEngine.ts
│   └── pdfGenerator.ts
│
└── data/
    ├── foods.ts
    └── suggestions.ts
```

A lógica de negócio deverá permanecer separada dos componentes React.

---

# 24. Requisitos Funcionais

**RF01** — Solicitar alimentos disponíveis ao iniciar.

**RF02** — Aceitar vários alimentos em uma única entrada.

**RF03** — Classificar alimentos entre fruta, salgado e doce.

**RF04** — Solicitar classificação manual para alimentos desconhecidos.

**RF05** — Gerar planejamento de segunda a sexta.

**RF06** — Garantir exatamente duas frutas diferentes por dia.

**RF07** — Garantir exatamente um acompanhamento por dia.

**RF08** — Maximizar variedade das frutas.

**RF09** — Alternar doce e salgado quando possível.

**RF10** — Evitar acompanhamentos consecutivos iguais.

**RF11** — Detectar quantidade insuficiente de alimentos.

**RF12** — Exibir até cinco sugestões saudáveis.

**RF13** — Indicar necessidade de conservação quando aplicável.

**RF14** — Permitir exportação para PDF.

**RF15** — Permitir iniciar uma nova semana.

---

# 25. Requisitos Não Funcionais

### Performance

A geração deverá parecer instantânea ao usuário.

Meta:

```text
< 100 ms
```

para o algoritmo local de planejamento em dispositivos modernos.

### Responsividade

Suportar:

```text
Mobile
Tablet
Desktop
```

Mobile deve ser considerado a experiência prioritária.

### Privacidade

Nenhuma informação sobre a criança ou alimentos deverá ser enviada para servidores externos para realizar o planejamento.

### Offline

A arquitetura deverá permitir evolução futura para PWA/offline.

---

# 26. Critérios de Aceite

O MVP estará concluído quando for possível:

1. abrir a aplicação;
2. receber a pergunta sobre alimentos disponíveis;
3. informar alimentos;
4. identificar itens conhecidos;
5. classificar manualmente itens desconhecidos;
6. gerar cinco lanches válidos;
7. garantir `2 frutas + 1 acompanhamento`;
8. visualizar os cinco dias;
9. receber sugestões adicionais;
10. visualizar alertas de conservação quando necessários;
11. exportar o planejamento para PDF;
12. iniciar uma nova semana.

Tudo isso deverá funcionar **sem backend, banco de dados, login ou API de IA**.

---

# 27. Fluxo Completo

```text
ABRIR APP
   │
   ▼
🍎 Perguntar alimentos
   │
   ▼
Usuário informa lista
   │
   ▼
Parser
   │
   ▼
Classificar alimentos
   │
   ├── desconhecido ──► perguntar categoria
   │                         │
   │                         ▼
   └──────────────────── continuar
   │
   ▼
Validar quantidade
   │
   ├── insuficiente ──► pedir mais opções
   │
   ▼
Gerar combinações
   │
   ▼
Montar Segunda → Sexta
   │
   ▼
🍎 Exibir planejamento
   │
   ├── 💡 Sugestões
   ├── ❄️ Conservação
   └── 📄 Exportar PDF
            │
            ▼
       PDF local
```

---

# 28. Princípios do Produto

O School Snack Planner deverá permanecer:

**Simples** — montar a semana deve levar poucos segundos.

**Determinístico** — regras importantes não dependem da interpretação de uma IA.

**Privado** — nenhuma informação precisa sair do dispositivo.

**Gratuito para operar** — geração dos planejamentos não gera custo de API.

**Prático** — a experiência deve ser pensada para um responsável organizando rapidamente os lanches da semana.

**Extensível** — no futuro poderão ser adicionados idade, localização, preferências, restrições alimentares, histórico e IA sem exigir reescrita completa do domínio.
