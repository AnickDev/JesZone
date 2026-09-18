import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { isFavorito, toggleFavorito } from "@/lib/favoritos.js";

export function FavoritoButton({ turmaId, nome, onFavoritar }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(isFavorito(turmaId));
    sync();
    window.addEventListener("jes-favoritos", sync);
    return () => window.removeEventListener("jes-favoritos", sync);
  }, [turmaId]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const vaiFavoritar = !fav;
        toggleFavorito(turmaId);
        // Só notifica o "pai" quando a turma está sendo adicionada aos favoritos
        // (não ao desfavoritar), para permitir levar o usuário até a aba de
        // favoritos de onde ele estiver usando este botão.
        if (vaiFavoritar) onFavoritar?.(turmaId);
      }}
      aria-pressed={fav}
      aria-label={`${fav ? "Remover" : "Favoritar"} ${nome}`}
      className="p-1 rounded hover:bg-foreground/5 transition"
    >
      <Star className={`size-4 ${fav ? "text-accent fill-accent" : "text-muted-foreground"}`} />
    </button>
  );
}
