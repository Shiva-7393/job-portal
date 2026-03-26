const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: function requiredPassword() {
                return this.authProvider !== 'google'
            },
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true,
        },
        role: {
            type: String,
            enum: ['student', 'recruiter'],
            required: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)