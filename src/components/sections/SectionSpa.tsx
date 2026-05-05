import { ContentSection } from "./ContentSection";

export function SectionSpa() {
  return (
    <section data-section="spa" className="h-full w-screen flex-shrink-0 bg-background">
      <ContentSection
        eyebrow="Sanctuary"
        title="The Spa, In Silence"
        body="Stone vaults, thermal water, and rituals tuned to the body's quietest signals. A place to disappear into yourself."
        align="left"
        accent="bg-secondary"
      />
    </section>
  );
}
