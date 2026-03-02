"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { Song } from "../page";

const songSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  base_chord: z.string().optional(),
  lyrics_and_chords: z.string().optional(),
  external_links: z.string().optional(),
  dmca_takedown: z.boolean().default(false),
  dmca_status_notes: z.string().optional(),
});

type SongFormValues = z.infer<typeof songSchema>;

interface Props {
  song?: Song;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SongForm({ song, onSuccess, onCancel }: Props) {
  const form = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: song?.title ?? "",
      artist: Array.isArray(song?.artist) ? song.artist.join(", ") : (song?.artist ?? ""),
      base_chord: song?.base_chord ?? "",
      lyrics_and_chords: song?.lyrics_and_chords ?? "",
      external_links: song?.external_links ? JSON.stringify(song.external_links) : "",
      dmca_takedown: song?.dmca_takedown ?? false,
      dmca_status_notes: song?.dmca_status_notes ?? "",
    },
  });

  async function onSubmit(values: SongFormValues) {
    const body = {
      ...values,
      external_links: values.external_links
        ? (() => {
            try {
              return JSON.parse(values.external_links!);
            } catch {
              return values.external_links;
            }
          })()
        : null,
    };

    const method = song ? "PUT" : "POST";
    const url = song ? `/api/admin/songs/${song.id}` : "/api/admin/songs";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      form.setError("root", { message: err.message ?? "Failed to save song" });
      return;
    }
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Amazing Grace" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist</FormLabel>
                <FormControl>
                  <Input placeholder="Hillsong Worship" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="base_chord"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Chord (Key)</FormLabel>
              <FormControl>
                <Input placeholder="C, G, Am, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lyrics_and_chords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lyrics & Chords</FormLabel>
              <FormControl>
                <Textarea placeholder="[Verse 1]&#10;Amazing grace..." rows={8} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="external_links"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Links (JSON)</FormLabel>
              <FormControl>
                <Input placeholder='{"youtube": "https://..."}' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dmca_takedown"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">DMCA Takedown</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dmca_status_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DMCA Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Optional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : song ? "Save Changes" : "Create Song"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
