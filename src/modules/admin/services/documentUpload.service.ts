import { S3, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BookingModel, IBooking } from "../../shared/models/booking.model";
import { Express } from "express";

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.AWS_REGION ?? "",
});

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  link: string;
  key: string;
}

export class DocumentUploadService {
  // Upload a file to S3
  private static async uploadToS3(file: Express.Multer.File, folder: string): Promise<UploadedFile> {
    const uniqueKey = `${folder}/${Date.now()}-${file.originalname}`;
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
      key: uniqueKey
    };
  }

  // Delete a file from S3
  private static async deleteFromS3(key: string): Promise<void> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME ?? "",
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  }

  // Upload documents to a booking
  static async uploadDocuments(bookingId: string, files: Express.Multer.File[]): Promise<UploadedFile[]> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Upload all files to S3 in parallel
    const uploadedFiles = await Promise.all(files.map(file => this.uploadToS3(file, 'documents')));

    // Add documents to booking
    const documentsToAdd = uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      link: file.link
    }));

    booking.documents.push(...documentsToAdd);
    await booking.save();

    return uploadedFiles;
  }

  // Upload itineraries to a booking
  static async uploadItineraries(bookingId: string, files: Express.Multer.File[]): Promise<UploadedFile[]> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Upload all files to S3 in parallel
    const uploadedFiles = await Promise.all(files.map(file => this.uploadToS3(file, 'itineraries')));

    // Add itineraries to booking
    const itinerariesToAdd = uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      link: file.link
    }));

    booking.itineraries.push(...itinerariesToAdd);
    await booking.save();

    return uploadedFiles;
  }

  // Remove document from booking
  static async removeDocument(bookingId: string, documentIndex: number): Promise<any> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (documentIndex < 0 || documentIndex >= booking.documents.length) {
      throw new Error("Invalid document index");
    }

    const removedDocument = booking.documents.splice(documentIndex, 1)[0];
    await booking.save();

    return removedDocument;
  }

  // Remove itinerary from booking
  static async removeItinerary(bookingId: string, itineraryIndex: number): Promise<any> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (itineraryIndex < 0 || itineraryIndex >= booking.itineraries.length) {
      throw new Error("Invalid itinerary index");
    }

    const removedItinerary = booking.itineraries.splice(itineraryIndex, 1)[0];
    await booking.save();

    return removedItinerary;
  }
} 