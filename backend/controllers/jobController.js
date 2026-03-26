const Job = require('../models/Job')
const Application = require('../models/Application')

const createJob = async (req, res) => {
    try {
        const { title, company, location, description, postedBy } = req.body

        if (!title || !company || !location || !description || !postedBy) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const job = await Job.create({
            title,
            company,
            location,
            description,
            postedBy,
        })

        return res.status(201).json({ message: 'Job posted successfully', job })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
        })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email role')
        return res.status(200).json(jobs)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getJobsByRecruiter = async (req, res) => {
    try {
        const { recruiterId } = req.params

        const jobs = await Job.find({
            postedBy: recruiterId,
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
        })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email role')

        return res.status(200).json(jobs)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const deleteJobByRecruiter = async (req, res) => {
    try {
        const { jobId } = req.params
        const recruiterId = req.body.recruiterId || req.query.recruiterId

        if (!recruiterId) {
            return res.status(400).json({ message: 'recruiterId is required' })
        }

        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).json({ message: 'Job not found' })
        }

        if (String(job.postedBy) !== String(recruiterId)) {
            return res.status(403).json({ message: 'You can remove only your own jobs' })
        }

        await Job.findByIdAndDelete(jobId)
        await Application.deleteMany({ job: jobId })

        return res.status(200).json({ message: 'Job removed successfully' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createJob,
    getAllJobs,
    getJobsByRecruiter,
    deleteJobByRecruiter,
}
