import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import productRoutes from "../modules/products/product.routes";
import { userRoutes } from "../modules/users/user.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/products", productRoutes);

export { apiRouter };
