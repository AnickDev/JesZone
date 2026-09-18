import { motion } from "motion/react";
import bolaMucha from "../assets/bolaMucha.png"

export function EmptyState({
  icon = bolaMucha,
  titulo,
  descricao,
  children }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <motion.div
        className="text-5xl"
        animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      >
        {typeof icon === "string" ? (
          <img
            src={icon}
            alt="Ícone"
            className="w-22 h-22 object-contain mx-auto"
          />
        ) : (
          icon
        )}
      </motion.div>
      <h3 className="mt-1 font-display text-2xl tracking-wider text-accent">{titulo}</h3>
      {descricao && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{descricao}</p>
      )}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  );
}
