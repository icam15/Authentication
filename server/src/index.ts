import express, { Request, Response } from "express";
import { config } from "dotenv";

config();
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Initial setup success");
});

app.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT}`);
});
