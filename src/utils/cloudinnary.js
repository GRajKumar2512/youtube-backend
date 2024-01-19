import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// get the localfilepath and upload, then receive a url from the service
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // after successful file upload
    console.log(response.url);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };

// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );
