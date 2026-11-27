import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { apiRouter } from "./routes";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Commerce Engine is running",
  });
});

app.use("/api", apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export { app };
