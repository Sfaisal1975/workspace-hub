import { Router, type IRouter } from "express";
import healthRouter from "./health";
import notionRouter from "./notion";
import publishedRouter from "./published";
import mailRouter from "./mail";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/notion", notionRouter);
router.use("/published", publishedRouter);
router.use(mailRouter);

export default router;
