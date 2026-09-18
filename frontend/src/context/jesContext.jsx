import { createContext, useContext } from "react";
import { EMPTY_STATE } from "@/lib/jesConfig.js";
import { useJes, useJesRealtime } from "@/lib/jesDados.js";

const JesCtx = createContext({
  state: EMPTY_STATE,
  carregando: false,
  erro: null,
  atualizando: false,
  recarregar: () => {},
});

export function JesProvider({ children }) {
  const { state, carregando, erro, atualizando, recarregar } = useJes();
  useJesRealtime();
  return (
    <JesCtx.Provider
      value={{ state, carregando, erro, atualizando, recarregar: () => void recarregar() }}
    >
      {children}
    </JesCtx.Provider>
  );
}

/** Estado completo do JES vindo do banco (com atualização periódica). */
export function useJesData() {
  return useContext(JesCtx);
}

/** Atalho para quem só precisa dos dados. */
export function useJesState() {
  return useContext(JesCtx).state;
}
