const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const bookModel = require('../models/bookModel')

router.post('/register', userController.createUser)

router.post('/login', userController.userLogIn)

router.post('/books', bookController.createBook)

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})

module.exports = router