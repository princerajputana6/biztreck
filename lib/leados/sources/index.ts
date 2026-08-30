// LeadOS — source registry. One place that knows every lead source; the API
// route and UI iterate this instead of hard-coding source ids.

import { googleMapsAdapter } from "./google-maps";
import { productHuntAdapter } from "./product-hunt";
import type { SourceAdapter } from "./types";

export const SOURCE_ADAPTERS: SourceAdapter[] = [googleMapsAdapter, productHuntAdapter];

export function getSourceAdapter(id: string): SourceAdapter | undefined {
  return SOURCE_ADAPTERS.find((a) => a.id === id);
}

/** Lightweight, credential-free descriptor for the UI (no adapter internals). */
export type SourceInfo = {
  id: string;
  label: string;
  intentSource: boolean;
  description: string;
  configured: boolean;
};

export function listSources(): SourceInfo[] {
  return SOURCE_ADAPTERS.map((a) => ({
    id: a.id,
    label: a.label,
    intentSource: a.intentSource,
    description: a.description,
    configured: a.isConfigured(),
  }));
}

export type { SourceAdapter, SourceRunOptions, SourceRunResult } from "./types";
