import express, { Router } from "express";
const router: Router = express.Router();

import { router as filesRouter } from "../files/fileRoutes";
import { router as messageRouter } from "../messages/messageRoute";
import { router as usersRouter } from "../users/userRoutes";
import { router as adminRouter } from "./admin";
import { router as indexRouter } from "./index";

router.use("/users", usersRouter);
router.use("/files", filesRouter);
router.use("/messages", messageRouter);
router.use("/admin", adminRouter);
router.use("/", indexRouter);

export default router;
