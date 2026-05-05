import { ContentSection } from "./ContentSection";

export function SectionWine() {
  return (
    <section data-section="wine" className="h-full w-screen flex-shrink-0 bg-background">
      <ContentSection
        eyebrow="Cellar"
        title="A Conversation in Wine"
        body="Two thousand labels, native varietals, and quiet rarities — chosen for the stories they pour, not the names they carry."
        align="left"
        accent="bg-secondary"
      />
    </section>
  );
}
