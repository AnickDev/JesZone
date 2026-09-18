import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/modalidades")({
  component: ModalidadesLayout,
});

function ModalidadesLayout() {
  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 pt-6">
      <Outlet />
    </div>
  );
}
