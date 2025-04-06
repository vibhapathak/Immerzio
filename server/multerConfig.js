// multerConfig.js
import multer from 'multer';
import path from 'path';

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/'); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix); // Use a unique filename
    }
});

// Create the multer instance
const upload = multer({ storage });

export default upload;
