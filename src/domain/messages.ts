/** Textos de domínio reaproveitados pela UI e pelo PDF (PRD §6, §12, §17). */

export const APP_NAME = "Lanchô";

export const TAGLINE = "Seu planejador de lancheiras da semana";

export const INITIAL_QUESTION =
  "Quais alimentos estão disponíveis para montar os lanches desta semana?";

export const INITIAL_HINT =
  "Pode informar frutas, salgados, doces e bebidas (sucos, iogurtes, água de coco).";

export const COOLER_BAG_NOTICE =
  "Alguns alimentos deste planejamento devem ser transportados em lancheira térmica para conservação adequada.";

export const INSUFFICIENT_FRUITS_TITLE =
  "Precisamos de pelo menos duas frutas diferentes para montar os lanches.";

export const INSUFFICIENT_FRUITS_ACTION = "Adicione pelo menos mais uma fruta.";

export const MISSING_ACCOMPANIMENT_TITLE = "Está faltando um acompanhamento.";

export const MISSING_ACCOMPANIMENT_ACTION =
  "Adicione pelo menos uma opção salgada ou doce.";

/**
 * A bebida é opcional: sem nenhuma o planejamento sai igual, só sem a linha da
 * bebida. Por isso isto é um aviso, não um bloqueio (PRD §12 não muda).
 */
export const NO_DRINK_NOTICE = "Nenhuma bebida informada: os dias saíram sem bebida.";

export const NO_DRINK_ACTION =
  "Para incluir, monte uma nova semana com sucos, iogurtes ou água de coco na lista.";
