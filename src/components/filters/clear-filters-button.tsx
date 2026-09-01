"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ClearFiltersButton({ count, onClear }: { count: number; onClear: () => void }) {
  if (count === 0) return null;

  return (
    <Button variant="ghost" size="sm" onClick={onClear}>
      <X className="h-3.5 w-3.5" aria-hidden />
      Clear {count}
    </Button>
  );
}
