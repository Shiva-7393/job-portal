const mongoose = require('mongoose')

mongoose.set('bufferCommands', false)

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log('MongoDB connected')
    } catch (error) {
        console.error('MongoDB connection error:', error.message)
    }
}

module.exports = connectDB
