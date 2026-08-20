// Task routes power the kanban workflow, completion actions, and task deletion.
import { Router } from "express";
import * as controller from "../controllers/task.controller";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { taskSchema } from "../models/schemas";

const router = Router();

// All task routes require authentication — the JWT middleware runs first.
router.get("/", authRequired, controller.listTasks);
router.post("/", authRequired, validate(taskSchema), controller.createTask);
router.put("/:id", authRequired, validate(taskSchema.partial()), controller.updateTask);
router.patch("/:id/complete", authRequired, controller.completeTask);
router.delete("/:id", authRequired, controller.deleteTask);

export default router;

