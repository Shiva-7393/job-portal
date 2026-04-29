const Application = require('../models/Application')
const Job = require('../models/Job')

const withResumeUrl = (application, req) => {
    const payload = application.toObject ? application.toObject() : application

    if (!payload.resumePath) {
        return {
            ...payload,
            resumeUrl: '',
        }
    }

    return {
        ...payload,
        resumeUrl: `${req.protocol}://${req.get('host')}${payload.resumePath}`,
    }
}

const applyForJob = async (req, res) => {
    try {
        const { studentId, jobId } = req.body

        if (!studentId || !jobId) {
            return res.status(400).json({ message: 'studentId and jobId are required' })
        }

        const existingApplication = await Application.findOne({
            student: studentId,
            job: jobId,
        })

        if (existingApplication) {
            return res.status(400).json({ message: 'You already applied for this job' })
        }

        const resumePath = req.file ? `/uploads/${req.file.filename}` : ''

        const application = await Application.create({
            student: studentId,
            job: jobId,
            resumePath,
        })

        return res.status(201).json({ message: 'Application submitted', application })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You already applied for this job' })
        }

        return res.status(500).json({ message: error.message })
    }
}

const getApplicationsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params

        const applications = await Application.find({ student: studentId })
            .sort({ createdAt: -1 })
            .populate('job')

        return res.status(200).json(applications.map((application) => withResumeUrl(application, req)))
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getApplicationsByRecruiter = async (req, res) => {
    try {
        const { recruiterId } = req.params

        const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id')
        const recruiterJobIds = recruiterJobs.map((job) => job._id)

        const applications = await Application.find({ job: { $in: recruiterJobIds } })
            .sort({ createdAt: -1 })
            .populate('job', 'title company location')
            .populate('student', 'name email role')

        return res.status(200).json(applications.map((application) => withResumeUrl(application, req)))
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    applyForJob,
    getApplicationsByStudent,
    getApplicationsByRecruiter,
}
