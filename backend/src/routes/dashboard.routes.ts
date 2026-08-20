// The dashboard route stays small because it only returns summary data.
import { Router } from "express";
import { summary } from "../controllers/dashboard.controller";
import { authRequired } from "../middleware/auth";

const router = Router();

router.get("/summary", authRequired, summary);

export default router;

