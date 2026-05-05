import { SECTIONS } from "@/utils/sections";

interface Props {
  activeIndex: number;
  onJump: (i: number) => void;
}

export function FixedNavbar({ activeIndex, onJump }: Props) {
  const navItems = SECTIONS.map((s, i) => ({ ...s, index: i })).filter((s) => s.inNav);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-6 mix-blend-difference">
      <a
        href="/"
        className="font-serif text-xl tracking-[0.2em] text-foreground"
        onClick={(e) => {
          e.preventDefault();
          onJump(0);
        }}
      >
        GRANANDER
      </a>
      <nav className="flex gap-8">
        {navItems.map((item) => {
          const active = item.index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onJump(item.index)}
              aria-current={active ? "page" : undefined}
              className={`text-xs uppercase tracking-[0.3em] transition-opacity ${
                active ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
