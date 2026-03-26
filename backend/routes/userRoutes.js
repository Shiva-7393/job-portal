const express = require('express')
const { getUsersCount } = require('../controllers/userController')

const router = express.Router()

router.get('/count', getUsersCount)

module.exports = router
