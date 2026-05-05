import { ContentSection } from "./ContentSection";

export function SectionHeritage() {
  return (
    <section data-section="heritage" className="h-full w-screen flex-shrink-0 bg-background">
      <ContentSection
        eyebrow="Since 1923"
        title="Hello, we are Radio & Co."
        body="Three generations have shaped this place — from a quiet country house into a refuge where time slows and craft endures."
        align="left"
        accent="bg-secondary"
      />
    </section>
  );
}
