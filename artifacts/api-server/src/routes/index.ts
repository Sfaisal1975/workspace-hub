import { Router, type IRouter } from "express";
import healthRouter from "./health";
import notionRouter from "./notion";
import publishedRouter from "./published";
import mailRouter from "./mail";
import correspondenceRouter from "./correspondence";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/notion", notionRouter);
router.use("/published", publishedRouter);
router.use(mailRouter);
router.use("/correspondence", correspondenceRouter);

export default router;
