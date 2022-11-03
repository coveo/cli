import express from "express";
import cors from "cors";
import { ensureTokenGenerated } from "./middlewares/searchToken";
import { environmentCheck } from "./middlewares/environmentCheck";
import { fetch } from "undici";

if (!Object.keys(global).includes("fetch")) {
  Object.defineProperty(global, "fetch", { value: fetch });
}
const app = express();

app.use(express.json());
app.use(cors());

app.get<Record<string, string>, any, { token: string }>(
  "/token",
  environmentCheck,
  ensureTokenGenerated,
  (req, res) => {
    res.json({ token: req.body.token });
  }
);

export const handler = app;
