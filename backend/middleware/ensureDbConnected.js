const mongoose = require('mongoose')

const ensureDbConnected = (_req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database is not connected. Start MongoDB or update MONGO_URI.',
        })
    }

    next()
}

module.exports = ensureDbConnected
