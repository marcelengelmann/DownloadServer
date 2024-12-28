import express, { Router } from "express";
const router: Router = express.Router();

import { router as files } from "../files/fileRoutes";
import { router as usersRouter } from "../users/userRoutes";
import { router as adminRouter } from "./admin";
import { router as indexRouter } from "./index";

router.use("/users", usersRouter);
router.use("/files", files);
router.use("/admin", adminRouter);
router.use("/", indexRouter);

export default router;
