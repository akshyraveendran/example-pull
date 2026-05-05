export function SectionRecommendations() {
  return (
    <section
      data-section="recommendations"
      className="flex h-full w-screen flex-shrink-0 flex-col items-center justify-center bg-background px-16 text-center"
    >
      <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Honored by</span>
      <h2 className="mt-6 font-serif text-5xl leading-tight text-foreground">
        Recognized Quietly,<br />Returned to Often
      </h2>
      <div className="mt-12 flex gap-12 text-sm uppercase tracking-[0.3em] text-muted-foreground">
        <span>Relais &amp; Châteaux</span>
        <span>Michelin Guide</span>
        <span>Condé Nast</span>
        <span>Travel + Leisure</span>
      </div>
    </section>
  );
}
