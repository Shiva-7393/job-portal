const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },
        resumePath: { type: String, default: '' },
        status: {
            type: String,
            enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'],
            default: 'applied',
        },
    },
    { timestamps: true }
)

applicationSchema.index({ student: 1, job: 1 }, { unique: true })

module.exports = mongoose.model('Application', applicationSchema)
