const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/db')
const ensureDbConnected = require('./middleware/ensureDbConnected')
const authRoutes = require('./routes/authRoutes')
const jobRoutes = require('./routes/jobRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
    'https://job-portal-cs8i.vercel.app',
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean)

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', ensureDbConnected, authRoutes)
app.use('/api/jobs', ensureDbConnected, jobRoutes)
app.use('/api/applications', ensureDbConnected, applicationRoutes)
app.use('/api/users', ensureDbConnected, userRoutes)

app.get('/', (_req, res) => {
    res.send('Student Job Portal API is running')
})

connectDB()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})