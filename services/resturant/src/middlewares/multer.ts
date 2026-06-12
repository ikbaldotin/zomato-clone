import multer from "multer";
const storage = multer.memoryStorage();
const uploadFile = multer({}).single("file");

export default uploadFile;
