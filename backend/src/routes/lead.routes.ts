// Lead routes expose the core CRM workflow in a predictable REST shape.
// The validate middleware runs before the controller to ensure clean input.
import { Router } from "express";
import * as controller from "../controllers/lead.controller";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { leadSchema } from "../models/schemas";

const router = Router();

// All lead routes require authentication.
router.get("/", authRequired, controller.listLeads);
router.post("/", authRequired, validate(leadSchema), controller.createLead);
router.put("/:id", authRequired, validate(leadSchema.partial()), controller.updateLead);
router.delete("/:id", authRequired, controller.deleteLead);

export default router;

