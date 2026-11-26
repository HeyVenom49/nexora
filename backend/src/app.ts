import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import { userRoutes } from "./modules/users/user.routes";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { authRoutes } from "./modules/auth/auth.route";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Commerce Engine is running",
  });
});

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export { app };
