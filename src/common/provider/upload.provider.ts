
import * as fs from 'fs'
import { v2 as cloudinary } from "cloudinary";



// src/services/upload.service.ts
export interface IUploadService {
  uploadFiles(files: Express.Multer.File[]): Promise<string[]>;
  uploadVideo(file: Express.Multer.File): Promise<string | null>;
}

export class CloudinaryUploadService implements IUploadService {
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      try {
        if (!file.path || !fs.existsSync(file.path)) {
          console.log("Invalid or missing file path:", file.path);
          return null;
        }
        const response = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });
        console.log("Cloudinary upload success:", response.secure_url);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log("Local file deleted:", file.path);
        }
        return response.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  }

  async uploadVideo(file: Express.Multer.File): Promise<string | null> {
    try {
      if (!file.path || !fs.existsSync(file.path)) {
        console.log("Invalid or missing file path:", file.path);
        return null;
      }
      const response = await cloudinary.uploader.upload(file.path, {
        resource_type: "video",
      });
      console.log("Cloudinary video upload success:", response.secure_url);
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log("Local file deleted:", file.path);
      }
      return response.secure_url;
    } catch (error) {
      console.error("Cloudinary video upload error:", error);
      return null;
    }
  }
}