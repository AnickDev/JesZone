import express from "express";
import cors from "cors";
import helmet from "helmet";
import rotas from "./src/routes/index.js";
import { tratadorErros, rotaNaoEncontrada } from "./src/middlewares/tratadorErros.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/saude", (req, res) => {
  res.json({ status: "ok", servico: "JES 2026 API" });
});

app.use("/api", rotas);

app.use(rotaNaoEncontrada);
app.use(tratadorErros);

export default app;
