import type { ComponentType } from "react";
import { SectionHero } from "@/components/sections/SectionHero";
import { SectionHeritage } from "@/components/sections/SectionHeritage";
import { SectionCuisine } from "@/components/sections/SectionCuisine";
import { SectionWine } from "@/components/sections/SectionWine";
import { SectionRooms } from "@/components/sections/SectionRooms";
import { SectionSpa } from "@/components/sections/SectionSpa";
import { SectionExperience } from "@/components/sections/SectionExperience";
import { SectionRecommendations } from "@/components/sections/SectionRecommendations";

export type SectionId =
  | "hero"
  | "heritage"
  | "cuisine"
  | "wine"
  | "rooms"
  | "spa"
  | "experience"
  | "recommendations";

export interface SectionDef {
  id: SectionId;
  label: string;
  inNav: boolean;
  Component: ComponentType<{ progress: number; active: boolean }>;
}

// Single source of truth — Blueprint order, locked.
export const SECTIONS: SectionDef[] = [
  { id: "hero", label: "Home", inNav: true, Component: SectionHero },
  { id: "heritage", label: "Heritage", inNav: true, Component: SectionHeritage },
  { id: "cuisine", label: "Cuisine", inNav: true, Component: SectionCuisine },
  { id: "wine", label: "Wine", inNav: true, Component: SectionWine },
  { id: "rooms", label: "Rooms", inNav: true, Component: SectionRooms },
  { id: "spa", label: "Spa", inNav: true, Component: SectionSpa },
  { id: "experience", label: "Summer", inNav: true, Component: SectionExperience },
  { id: "recommendations", label: "Recommendations", inNav: false, Component: SectionRecommendations },
];

export const SECTION_COUNT = SECTIONS.length;
