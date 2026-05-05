import { ContentSection } from "./ContentSection";

export function SectionCuisine() {
  return (
    <section data-section="cuisine" className="h-full w-screen flex-shrink-0 bg-background">
      <ContentSection
        eyebrow="Kitchen"
        title="Cuisine of the Land"
        body="Seasonal menus drawn from neighboring farms, foraged herbs, and the slow rhythm of fire. A table where every plate has provenance."
        align="right"
        accent="bg-muted"
      />
    </section>
  );
}
