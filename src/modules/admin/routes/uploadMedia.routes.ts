import { Router } from "express";
import multer from "multer";
import { uploadMedia } from "../controllers/uploadMedia.controller";
import { authenticate } from "../../../middleware/authMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authenticate, upload.array("files"), uploadMedia);

export default router;
