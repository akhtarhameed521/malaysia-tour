import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs"; // Explicitly import fs with type support

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.log("Invalid or missing localFilePath:", localFilePath);
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("Cloudinary upload success:", response.secure_url);

    // Delete local file only if it exists and upload was successful
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted:", localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null; // Return null on error to indicate failure
  }
};

export { uploadCloudinary };