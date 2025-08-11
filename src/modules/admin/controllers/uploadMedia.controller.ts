import { Request, Response } from "express";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { Express } from "express"; // For `Express.Multer.File`

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.AWS_REGION ?? "",
});

// Function to upload a file to S3 using the v3 command interface
const uploadToS3 = async (file: Express.Multer.File) => {
  const uniqueKey = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME ?? "",
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const link = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

  return {
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    link,
  };
};

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[]; // Type assertion

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    // Upload all files to S3 in parallel
    const uploadedFiles = await Promise.all(files.map(uploadToS3));
    res.json(uploadedFiles);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
