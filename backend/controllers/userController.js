const User = require('../models/User')

const getUsersCount = async (_req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        return res.status(200).json({ totalUsers })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getUsersCount,
}
