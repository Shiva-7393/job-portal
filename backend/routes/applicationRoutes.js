const express = require('express')
const {
    applyForJob,
    getApplicationsByStudent,
    getApplicationsByRecruiter,
} = require('../controllers/applicationController')
const upload = require('../middleware/upload')

const router = express.Router()

router.post('/apply', upload.single('resume'), applyForJob)
router.get('/student/:studentId', getApplicationsByStudent)
router.get('/recruiter/:recruiterId', getApplicationsByRecruiter)

module.exports = router
