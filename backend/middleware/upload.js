const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({ storage })

module.exports = upload
