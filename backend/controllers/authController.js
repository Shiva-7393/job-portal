const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')

const normalizeEmail = (email) => email.trim().toLowerCase()
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const ensureDbConnected = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: 'Database is not connected. Start MongoDB or update MONGO_URI.',
        })
        return false
    }

    return true
}

const register = async (req, res) => {
    try {
        if (!ensureDbConnected(res)) {
            return
        }

        const { name, email, password, role } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if (!['student', 'recruiter'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role selected' })
        }

        const normalizedEmail = normalizeEmail(email)

        const existingUser = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
        })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role,
        })

        return res.status(201).json({
            message: 'Registration successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const login = async (req, res) => {
    try {
        if (!ensureDbConnected(res)) {
            return
        }

        const { email, password, role } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const normalizedEmail = normalizeEmail(email)

        const user = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
        })
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register first.' })
        }

        if (!user.password) {
            return res.status(400).json({
                message: 'This account uses Google login. Please continue with Google.',
            })
        }

        const passwordMatched = await bcrypt.compare(password, user.password)
        if (!passwordMatched) {
            return res.status(400).json({ message: 'Invalid password' })
        }

        if (role && user.role !== role) {
            return res.status(400).json({ message: 'Role does not match this account' })
        }

        return res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const googleLogin = async (req, res) => {
    try {
        if (!ensureDbConnected(res)) {
            return
        }

        const { credential, role } = req.body

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({
                message: 'Google login is not configured on server',
            })
        }

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' })
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()

        if (!payload?.email || !payload?.sub) {
            return res.status(400).json({ message: 'Invalid Google token payload' })
        }

        const normalizedEmail = normalizeEmail(payload.email)

        let user = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
        })

        if (!user) {
            if (!role || !['student', 'recruiter'].includes(role)) {
                return res.status(400).json({
                    message: 'Select a valid role to create your account with Google',
                })
            }

            user = await User.create({
                name: payload.name || normalizedEmail,
                email: normalizedEmail,
                role,
                authProvider: 'google',
                googleId: payload.sub,
            })
        } else {
            if (role && user.role !== role) {
                return res.status(400).json({ message: 'Role does not match this account' })
            }

            if (!user.googleId) {
                user.googleId = payload.sub
            }

            if (payload.name && user.name !== payload.name) {
                user.name = payload.name
            }

            await user.save()
        }

        return res.status(200).json({
            message: 'Google login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (_error) {
        return res.status(401).json({ message: 'Google authentication failed' })
    }
}

module.exports = {
    register,
    login,
    googleLogin,
}
