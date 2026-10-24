"use client";

import { useState } from "react";

import { Toggle } from "@/components/ui/toggle";

import { DEMO_SONG } from "../_lib/home";
import { KeyPicker } from "./key-picker";
import { Lyrics } from "./lyrics";

// The real song view parts (KeyPicker + Lyrics) on a fixed song, so visitors can try transposing before signing up.
export function TransposeDemo() {
  const [key, setKey] = useState(DEMO_SONG.key);
  const [showChords, setShowChords] = useState(true);

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4 text-card-foreground shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-primary text-xs uppercase tracking-wider">Try it now</p>
          <h2 className="truncate font-semibold text-lg">{DEMO_SONG.title}</h2>
          <p className="text-muted-foreground text-sm">{DEMO_SONG.credit}</p>
        </div>
        <Toggle
          variant="outline"
          size="sm"
          pressed={showChords}
          onPressedChange={setShowChords}
          aria-label="Show chords"
          className="shrink-0"
        >
          Chords
        </Toggle>
      </div>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs">Tap a key — every chord follows.</p>
        <KeyPicker value={key} onChange={setKey} originalKey={DEMO_SONG.key} />
      </div>
      <Lyrics source={DEMO_SONG.chordpro} fromKey={DEMO_SONG.key} toKey={key} showChords={showChords} />
    </div>
  );
}
