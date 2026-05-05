import { ContentSection } from "./ContentSection";

export function SectionRooms() {
  return (
    <section data-section="rooms" className="h-full w-screen flex-shrink-0 bg-background">
      <ContentSection
        eyebrow="Stay"
        title="Rooms That Hold the Light"
        body="Each room a quiet composition of linen, stone, and morning sun — restored in dialogue with the architecture that holds them."
        align="right"
        accent="bg-muted"
      />
    </section>
  );
}
