"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="system"
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "font-sans !border-border !bg-card !text-card-foreground shadow-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };