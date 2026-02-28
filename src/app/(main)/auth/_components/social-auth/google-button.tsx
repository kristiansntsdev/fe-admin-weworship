import type React from "react";

import { siGoogle } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GoogleButton({
  className,
  variant = "secondary",
}: {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <Button variant={variant} className={cn(className)} asChild>
      <a href="/api/auth/google?client=web">
        <SimpleIcon icon={siGoogle} className="size-4" />
        Continue with Google
      </a>
    </Button>
  );
}
