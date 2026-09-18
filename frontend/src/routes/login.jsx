import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/painel/jes-2026/entrada" });
  },
});
