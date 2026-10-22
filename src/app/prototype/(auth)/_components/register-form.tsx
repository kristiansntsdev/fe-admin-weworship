"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { prototypeRegister } from "../../_lib/auth-actions";

// Same rules as be-weworship utils.ValidateUsername (reserved names are still checked server-side).
const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9]|[._-](?=[A-Za-z0-9]))*$/;

const FormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(6, { message: "Username must be at least 6 characters." })
    .max(30, { message: "Username must be at most 30 characters." })
    .regex(USERNAME_RE, {
      message: "Use letters and numbers; . _ - only between them (not at the start, end or twice in a row).",
    }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function RegisterForm({ from }: { from?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setServerError(null);
    const result = await prototypeRegister(data.username, data.email, data.password, from);
    if (result?.error) {
      setServerError(result.error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="worship.leader" autoComplete="username" autoCapitalize="none" {...field} />
              </FormControl>
              <FormDescription>Others can invite you by this name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError && <p className="text-destructive text-sm">{serverError}</p>}
        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
