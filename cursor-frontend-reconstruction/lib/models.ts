/**
 * First-party model data reconstructed from module 932341
 * (`LATEST_1P_MODEL`). The shipped object carries no `effort` tag, but the
 * model pickers read the field, so it stays in the shape.
 */

export interface FirstPartyModel {
  id: string;
  label: string;
  effort?: string;
}

export const LATEST_1P_MODEL: FirstPartyModel = { id: "composer-2.5", label: "Composer 2.5" };
