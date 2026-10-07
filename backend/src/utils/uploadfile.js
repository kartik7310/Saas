import imagekit from "../config/imagekit.js";
import logger from "../config/logger.js";

export const uploadToImageKit = async (file) => {
    try {
        const response = await imagekit.upload({
            file: file.buffer,
            fileName: `${Date.now()}-${file.originalname}`,
            folder: "/properties",
        });
        return { url: response.url, fileId: response.fileId };
    } catch (error) {
        logger.error(`ImageKit upload error: ${error.message}`);
        throw new Error("Failed to upload image");
    }
};

export const deleteFromImageKit = async (fileId) => {
    try {
        if (!fileId) return;
        await imagekit.deleteFile(fileId);
        logger.info(`Deleted file from ImageKit: ${fileId}`);
    } catch (error) {
        logger.error(`ImageKit delete error for ${fileId}: ${error.message}`);
    }
};