"use client";

import { use } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { PageHeader } from "../../../_components/page-header";
import { errorMessage, qk } from "../../../_lib/api";
import { createRequest } from "../../../_lib/requests";

// Mirrors the backend rule: a title plus at least one of lyrics or a reference link.
const FormSchema = z
  .object({
    song_title: z.string().trim().min(1, { message: "Song title is required." }),
    lyrics_type: z.enum(["lyrics", "lyrics_chords"]),
    lyrics: z.string().trim(),
    reference_link: z
      .string()
      .trim()
      .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), { message: "Enter a link starting with http(s)://" }),
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
                  <Textarea rows={8} placeholder="Paste the lyrics (with chords if you have them)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference link</FormLabel>
                <FormControl>
                  <Input type="url" inputMode="url" placeholder="https://youtube.com/…" {...field} />
                </FormControl>
                <FormDescription>
                  A YouTube, Spotify or chord-sheet link helps us find the right version.
                </FormDescription>
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
