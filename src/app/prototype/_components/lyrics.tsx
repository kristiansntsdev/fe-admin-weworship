import { buildWordSegments, parseChordProLine, SECTION_RE, transposeChord } from "../_lib/chordpro";

// ChordPro directive lines, e.g. {title: …} or {comment: Chorus}
const DIRECTIVE_RE = /^\{\s*([a-z_]+)\s*(?::\s*(.*?))?\s*\}$/i;
const LABEL_DIRECTIVES = new Set(["c", "comment", "ci", "comment_italic", "soc", "start_of_chorus"]);

function SectionLabel({ children }: { children: string }) {
  return <p className="pt-3 font-semibold text-primary text-xs uppercase tracking-wider">{children}</p>;
}

export function Lyrics({
  source,
  fromKey,
  toKey,
  showChords,
}: {
  source: string;
  fromKey: string | null;
  toKey: string | null;
  showChords: boolean;
}) {
  if (!source.trim()) {
    return <p className="text-muted-foreground text-sm">No lyrics available for this song.</p>;
  }

  const transpose = (chord: string) => (fromKey && toKey ? transposeChord(chord, fromKey, toKey) : chord);

  return (
    <div className="text-[15px] leading-relaxed">
      {source.split("\n").map((line, i) => {
        const key = `${i}`;
        const trimmed = line.trim();
        if (!trimmed) return <div key={key} className="h-4" />;

        const directive = trimmed.match(DIRECTIVE_RE);
        if (directive) {
          const name = directive[1].toLowerCase();
          if (LABEL_DIRECTIVES.has(name)) {
            return <SectionLabel key={key}>{directive[2] || (name.includes("chorus") ? "Chorus" : "")}</SectionLabel>;
          }
          return null;
        }

        if (SECTION_RE.test(trimmed)) {
          return <SectionLabel key={key}>{trimmed.replace(/:$/, "")}</SectionLabel>;
        }

        const segments = parseChordProLine(line);
        const hasChords = segments.some((s) => s.chord);

        if (showChords && hasChords) {
          return (
            <div key={key} className="flex flex-wrap items-end">
              {buildWordSegments(segments).map((ws, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: segments are derived from a static line
                <span key={j} className="inline-flex flex-col">
                  <span className="min-h-5 pr-1.5 font-mono font-semibold text-primary text-sm">
                    {ws.chord ? transpose(ws.chord) : " "}
                  </span>
                  <span className="whitespace-pre">{ws.text || " "}</span>
                </span>
              ))}
            </div>
          );
        }

        const text = segments.map((s) => s.text).join("");
        if (!text.trim()) return null;
        return (
          <p key={key} className="whitespace-pre-wrap">
            {text}
          </p>
        );
      })}
    </div>
  );
}
