import { useFrameSequence } from "@/hooks/useFrameSequence";
import { HeroFrameCanvas } from "@/components/hero/HeroFrameCanvas";

interface Props {
  progress: number;
  active: boolean;
}

// Hero section — frame container ready, no animation wired yet.
export function SectionHero({ progress, active }: Props) {
  const { ready, getFrame } = useFrameSequence(active);

  return (
    <section
      data-section="hero"
      className="relative h-full w-screen flex-shrink-0 overflow-hidden bg-background"
    >
      <HeroFrameCanvas progress={progress} ready={ready} getFrame={getFrame} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-6xl tracking-wide text-foreground">Tealandco</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Where Your Story Becomes Our Design
          </p>
        </div>
      </div>
    </section>
  );
}
