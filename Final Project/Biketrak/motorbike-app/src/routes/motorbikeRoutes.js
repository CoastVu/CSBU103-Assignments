const express = require('express');
const router = express.Router();
const multer = require('multer');
const motorbikeController = require('../controllers/motorbikeController');

const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/', motorbikeController.getMotorbikes);
router.get('/:id', motorbikeController.getMotorbikeById);
router.post('/', upload.single('image'), motorbikeController.createMotorbike);
router.put('/:id', upload.single('image'), motorbikeController.updateMotorbike);
router.delete('/:id', motorbikeController.deleteMotorbike);

module.exports = router;