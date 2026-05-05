interface Props {
  eyebrow: string;
  title: string;
  body: string;
  align: "left" | "right"; // text side
  accent: string; // tailwind bg class for the visual block
}

// Generic Blueprint section frame: text on one side, visual on the other.
// Self-contained — no cross-section imports, no scroll listeners.
export function ContentSection({ eyebrow, title, body, align, accent }: Props) {
  const textFirst = align === "left";
  return (
    <div className="grid h-full w-full grid-cols-2">
      {textFirst ? (
        <>
          <TextPane eyebrow={eyebrow} title={title} body={body} />
          <VisualPane accent={accent} label={title} />
        </>
      ) : (
        <>
          <VisualPane accent={accent} label={title} />
          <TextPane eyebrow={eyebrow} title={title} body={body} />
        </>
      )}
    </div>
  );
}

function TextPane({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="flex h-full flex-col justify-center px-16">
      <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{eyebrow}</span>
      <h2 className="mt-6 font-serif text-5xl leading-tight text-foreground">{title}</h2>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function VisualPane({ accent, label }: { accent: string; label: string }) {
  return (
    <div className={`relative h-full w-full ${accent}`}>
      <div className="absolute inset-0 flex items-end justify-end p-8">
        <span className="font-serif text-sm uppercase tracking-[0.3em] text-foreground/40">
          {label}
        </span>
      </div>
    </div>
  );
}
