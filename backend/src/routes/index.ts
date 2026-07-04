import { Router } from "express";
import titlesRouter from "./titles.js";
import watchlogRouter from "./watchlog.js";
import watchlistRouter from "./watchlist.js";
import collectionsRouter from "./collections.js";
import statsRouter from "./stats.js";
import usersRouter from "./users.js";

export const apiRouter = Router();

apiRouter.use("/titles", titlesRouter);
apiRouter.use("/watchlog", watchlogRouter);
apiRouter.use("/watchlist", watchlistRouter);
apiRouter.use("/collections", collectionsRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/users", usersRouter);
