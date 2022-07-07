const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const bookModel = require('../models/bookModel')
const middleWare = require("../middleware/auth")

// User APIs
router.post('/register', userController.createUser)

router.post('/login', userController.userLogIn)

// Book APIs
router.post('/books', middleWare.authentication, bookController.createBook)

router.get('/books', middleWare.authentication, bookController.getBooksByFilter)

router.get('/books/:bookId', middleWare.authentication, bookController.getBookByParams)

router.put('/books/:bookId', middleWare.authentication, bookController.updateBookById)

router.delete('/books/:bookId', middleWare.authentication, bookController.deleteBookById)

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})

module.exports = router