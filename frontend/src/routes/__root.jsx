import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader.jsx";
import { OnboardingTour } from "../components/OnboardingTour.jsx";
import { SosBanner } from "../components/SosBanner.jsx";
import { LembretesPopup } from "../components/LembretesPopup.jsx";
import { CategoriaProvider } from "@/context/categoria.jsx";
import { JesProvider } from "@/context/jesContext.jsx";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md text-center p-8">
        <h1 className="font-display text-7xl gold-text">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md text-center p-8">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold"
          >
            Tentar de novo
          </button>
          <a href="/" className="rounded-md border border-border px-4 py-2 text-sm">
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // O painel administrativo não usa o cabeçalho público, então não precisa do espaço dele.
  const isHome = pathname === "/";
  const semHeader = pathname.startsWith("/admin") || pathname.startsWith("/painel");
  // Card de "qual a sua série?" e lembretes são conteúdo do visitante comum:
  // não fazem sentido no painel admin/login (que já sabe quem é) nem no
  // telão (tela de projeção pública, sem interação de ninguém).
  const semConteudoVisitante = semHeader || pathname.startsWith("/telao");
  // No telão a taça atrapalha a leitura dos placares projetados.
  return (
    <QueryClientProvider client={queryClient}>
      <JesProvider>
        <CategoriaProvider>
          <div className={semHeader ? "admin-background min-h-screen" : isHome ? "home-background min-h-screen" : "min-h-screen"}>
            <SiteHeader />

            <main
              className={`relative z-10 pb-16 min-h-screen bg-transparent ${semHeader ? "pt-4" : "pt-16"
                }`}
            >
              <Outlet />
            </main>

            {!semConteudoVisitante && <OnboardingTour />}
            {!semConteudoVisitante && <LembretesPopup />}
            <SosBanner />
          </div>
        </CategoriaProvider>
      </JesProvider>
    </QueryClientProvider>
  );
}
