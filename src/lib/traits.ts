import { loadData } from './data';

export type Sex = 'Female' | 'Male';

export interface TraitInfo {
  name: string;
  abbrev: string;
  landmarks: string[];
}

export interface LandmarkPoint {
  x: number;
  y: number;
}

export interface TraitsMeta {
  traits: TraitInfo[];
  landmarks: Record<string, LandmarkPoint>;
  image: { width: number; height: number };
}

export function loadTraits(): Promise<TraitsMeta> {
  return loadData<TraitsMeta>('traits');
}

export function traitAbbrev(meta: TraitsMeta, name: string): string {
  const trait = meta.traits.find((t) => t.name === name);
  if (!trait) {
    throw new Error(`Unknown trait: ${name}`);
  }
  return trait.abbrev;
}

export function formatTraitString(sex: Sex, trait: string): string {
  return `${sex}: ${trait}`;
}
