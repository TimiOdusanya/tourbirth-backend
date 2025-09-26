import express from "express";
import { ContactController } from "../controllers/contact.controller";

const router = express.Router();

router.post("/", ContactController.submitContactForm);


router.get("/", ContactController.getAllContactEntries);
router.get("/:id", ContactController.getContactEntryById);
router.put("/:id", ContactController.updateContactEntry);
router.delete("/:id", ContactController.removeContactEntry);

export default router;
