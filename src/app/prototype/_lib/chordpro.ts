// Ported from mobile-weworship/lib/chordpro.ts (pure, no side effects) plus buildWordSegments from
// mobile-weworship/app/song/[id].tsx. Keep in sync with the mobile app.

export interface ChordProSegment {
  chord?: string;
  text: string;
}

export const KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const CHROMATIC_SCALE = KEYS;

// Normalize enharmonic equivalents to the canonical chromatic scale
const ENHARMONIC: Record<string, string> = {
  Db: "C#",
  "D#": "Eb",
  Fb: "E",
  "E#": "F",
  Gb: "F#",
  "G#": "Ab",
  "A#": "Bb",
  Cb: "B",
  "B#": "C",
};

export function normalizeRoot(root: string): string {
  return ENHARMONIC[root] ?? root;
}

// Root of a stored key such as "G", "Bb" or "Am" → canonical KEYS entry, or null when unknown.
export function keyRoot(key: string | null | undefined): string | null {
  const m = key?.trim().match(/^([A-G][#b]?)/);
  if (!m) return null;
  const root = normalizeRoot(m[1]);
  return KEYS.includes(root) ? root : null;
}

export function transposeChord(chord: string, fromKey: string, toKey: string): string {
  if (!chord || !fromKey || !toKey || fromKey === toKey) return chord;

  // Parse chord root: handle sharps/flats (2-char roots first)
  const rootMatch = chord.match(/^([A-G][#b]?)(.*)/);
  if (!rootMatch) return chord;

  const rawRoot = rootMatch[1];
  const suffix = rootMatch[2];
  const root = normalizeRoot(rawRoot);

  const fromIdx = CHROMATIC_SCALE.indexOf(normalizeRoot(fromKey));
  const toIdx = CHROMATIC_SCALE.indexOf(normalizeRoot(toKey));
  if (fromIdx === -1 || toIdx === -1) return chord;

  const rootIdx = CHROMATIC_SCALE.indexOf(root);
  if (rootIdx === -1) return chord;

  const semitones = (toIdx - fromIdx + 12) % 12;
  const newRoot = CHROMATIC_SCALE[(rootIdx + semitones) % 12];

  return newRoot + suffix;
}

export function parseChordProLine(line: string): ChordProSegment[] {
  const segments: ChordProSegment[] = [];
  const regex = /\[([^\]]+)\]([^[]*)/g;

  const firstBracket = line.indexOf("[");
  if (firstBracket > 0) {
    segments.push({ text: line.substring(0, firstBracket) });
  }

  for (const match of line.matchAll(regex)) {
    segments.push({ chord: match[1], text: match[2] || "" });
  }

  if (segments.length === 0) {
    segments.push({ text: line });
  }

  return segments;
}

// Splits chord segments into per-word pieces so lines wrap between words without detaching a chord from its syllable.
export function buildWordSegments(segments: ChordProSegment[]) {
  const result: { chord: string | null; text: string }[] = [];
  for (const seg of segments) {
    const chord = seg.chord || null;
    const text = seg.text;
    if (!text && !chord) continue;
    if (!text) {
      result.push({ chord, text: "" });
      continue;
    }

    // Split text into pieces that each end at a space boundary
    const pieces: string[] = [];
    let rest = text;
    while (rest.length > 0) {
      const sp = rest.indexOf(" ");
      if (sp === -1) {
        pieces.push(rest);
        break;
      }
      pieces.push(rest.slice(0, sp + 1)); // word + trailing space
      rest = rest.slice(sp + 1);
    }

    pieces.forEach((piece, idx) => {
      const segChord = idx === 0 ? chord : null;
      const prev = result[result.length - 1];
      // If this is a no-chord continuation that starts mid-word, merge into previous
      if (!segChord && idx === 0 && prev && !piece.startsWith(" ") && prev.text && !prev.text.endsWith(" ")) {
        prev.text += piece;
      } else {
        result.push({ chord: segChord, text: piece });
      }
    });
  }
  return result.filter((s) => s.text.trim() !== "" || s.chord);
}

// Section headers such as VERSE 1, CHORUS, BRIDGE (mobile song screen rule, plus INTERLUDE/REFF and a trailing colon).
export const SECTION_RE =
  /^(VERSE|CHORUS|BRIDGE|PRE-CHORUS|INTRO|OUTRO|ENDING|TAG|INTERLUDE|REFF?|V|C|B|P|I|O|E|T)\s*\d*:?$/i;
