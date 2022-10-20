import express, { Router } from "express";
const router: Router = express.Router();

import { router as indexRouter } from './index';
import { router as files } from './files';
import { router as usersRouter } from './users';
import { router as adminRouter } from './admin';

router.use("/users", usersRouter);
router.use("/files", files);
router.use("/admin", adminRouter);
router.use("/", indexRouter);

export default router;