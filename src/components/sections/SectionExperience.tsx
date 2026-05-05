import { ContentSection } from "./ContentSection";

export function SectionExperience() {
  return (
    <section data-section="experience" className="h-full w-screen flex-shrink-0 bg-background">
      <ContentSection
        eyebrow="Summer"
        title="Experiences in the Open"
        body="Vineyard walks, lake mornings, kitchen lessons under the pergola — a season of small, unhurried discoveries."
        align="right"
        accent="bg-muted"
      />
    </section>
  );
}
