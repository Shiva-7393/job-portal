const express = require('express')
const {
    createJob,
    getAllJobs,
    getJobsByRecruiter,
    deleteJobByRecruiter,
} = require('../controllers/jobController')

const router = express.Router()

router.get('/', getAllJobs)
router.get('/recruiter/:recruiterId', getJobsByRecruiter)
router.post('/', createJob)
router.delete('/:jobId', deleteJobByRecruiter)

module.exports = router
