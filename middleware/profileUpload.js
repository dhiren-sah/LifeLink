const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "../public/uploads/profiles");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `profile-${Date.now()}${extension}`);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }

    callback(new Error("Only image files are allowed."));
};

const profileUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

module.exports = profileUpload;
