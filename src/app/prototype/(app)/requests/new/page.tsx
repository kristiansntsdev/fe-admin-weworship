"use client";

import { use, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardPaste, ExternalLink } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { PageHeader } from "../../../_components/page-header";
import { SongLinkCheckPanel } from "../../../_components/song-link-check";
import { errorMessage, qk } from "../../../_lib/api";
import { createRequest } from "../../../_lib/requests";
import type { SongLinkCheck } from "../../../_lib/types";

const LINK_PATTERN = /^https?:\/\/\S+$/i;

// Mirrors the backend rule: a title plus at least one of lyrics or a reference link.
const FormSchema = z
  .object({
    song_title: z.string().trim().min(1, { message: "Song title is required." }),
    lyrics_type: z.enum(["lyrics", "lyrics_chords"]),
    lyrics: z.string().trim(),
    reference_link: z
      .string()
      .trim()
      .refine((v) => v === "" || LINK_PATTERN.test(v), { message: "Enter a link starting with http(s)://" }),
  })
  .refine((v) => v.lyrics !== "" || v.reference_link !== "", {
    message: "Add the lyrics or a reference link.",
    path: ["lyrics"],
  });

type FormValues = z.infer<typeof FormSchema>;

export default function NewRequestPage({ searchParams }: { searchParams: Promise<{ title?: string }> }) {
  const { title } = use(searchParams);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { song_title: title ?? "", lyrics_type: "lyrics", lyrics: "", reference_link: "" },
  });

  const [songTitle, link, lyricsType, lyrics] = useWatch({
    control: form.control,
    name: ["song_title", "reference_link", "lyrics_type", "lyrics"],
  });

  // Check the link once the user stops typing; pasting settles immediately after the same delay.
  const [checkUrl, setCheckUrl] = useState("");
  useEffect(() => {
    const value = link.trim();
    const timer = setTimeout(() => setCheckUrl(LINK_PATTERN.test(value) ? value : ""), 500);
    return () => clearTimeout(timer);
  }, [link]);

  const googleQuery = songTitle.trim();
  const googleHref = `https://www.google.com/search?q=${encodeURIComponent(`${googleQuery} chord`)}`;

  async function pasteLink() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) form.setValue("reference_link", text, { shouldDirty: true, shouldValidate: true });
    } catch {
      toast.error("Couldn't read the clipboard. Long-press the field to paste instead.");
    }
  }

  function applyCheck(check: SongLinkCheck) {
    form.setValue("lyrics_type", "lyrics_chords", { shouldDirty: true });
    form.setValue("lyrics", check.content ?? "", { shouldDirty: true, shouldValidate: true });
    if (!form.getValues("song_title").trim() && check.title) {
      form.setValue("song_title", check.title, { shouldDirty: true, shouldValidate: true });
    }
    toast.success("Lyrics & chords added. Check them below before sending.");
  }

  async function onSubmit(values: FormValues) {
    try {
      await createRequest({
        song_title: values.song_title,
        lyrics_type: values.lyrics_type,
        ...(values.lyrics ? { lyrics: values.lyrics } : {}),
        ...(values.reference_link ? { reference_link: values.reference_link } : {}),
      });
      toast.success("Request sent — we'll let you know when it's added.");
      await queryClient.invalidateQueries({ queryKey: qk.requests });
      router.push("/prototype/requests");
    } catch (err) {
      form.setError("root", { message: errorMessage(err) });
    }
  }

  return (
    <>
      <PageHeader title="Request a song" backHref="/prototype/requests" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-4">
          <FormField
            control={form.control}
            name="song_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Song title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Bapa Engkau Sungguh Baik" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm">Find it online</p>
              <p className="text-muted-foreground text-sm">
                Search Google for a chord sheet, copy its link and paste it below. We&apos;ll check whether we can read
                it.
              </p>
            </div>
            {googleQuery ? (
              <Button variant="outline" className="w-full" asChild>
                <a href={googleHref} target="_blank" rel="noopener noreferrer">
                  <span className="truncate">Search &ldquo;{googleQuery}&rdquo; on Google</span>
                  <ExternalLink />
                </a>
              </Button>
            ) : (
              <Button type="button" variant="outline" className="w-full" disabled>
                Enter a song title to search Google
              </Button>
            )}

            <FormField
              control={form.control}
              name="reference_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference link</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="url" inputMode="url" placeholder="https://…" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={pasteLink} aria-label="Paste link">
                      <ClipboardPaste />
                    </Button>
                  </div>
                  <FormDescription>A YouTube or Spotify link also helps us find the right version.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SongLinkCheckPanel
              url={checkUrl}
              lyrics={lyrics}
              onUse={applyCheck}
              onPick={(url) => form.setValue("reference_link", url, { shouldDirty: true, shouldValidate: true })}
            />
          </div>

          <FormField
            control={form.control}
            name="lyrics_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What are you sending?</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    className="w-full"
                  >
                    <ToggleGroupItem value="lyrics" className="flex-1">
                      Lyrics only
                    </ToggleGroupItem>
                    <ToggleGroupItem value="lyrics_chords" className="flex-1">
                      Lyrics + chords
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lyrics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lyrics</FormLabel>
                <FormControl>
                  {/* Chords sit above lyrics by column, so they need a fixed-width font and no wrapping. */}
                  <Textarea
                    rows={8}
                    placeholder="Paste the lyrics (with chords if you have them)"
                    wrap={lyricsType === "lyrics_chords" ? "off" : undefined}
                    className={cn(lyricsType === "lyrics_chords" && "whitespace-pre font-mono text-xs leading-5")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending…" : "Send request"}
          </Button>
        </form>
      </Form>
    </>
  );
}
