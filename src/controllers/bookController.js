const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const moment = require('moment')

const isValid = function (value) {
    if ( value === "undefined" || value === null) return false
    if (typeof value !== "string" || value.trim().length === 0) return false
    return true
}

const isValidDate = (d) => moment(d, 'YYYY-MM-DD', true).isValid()

const createBook = async function(req, res){
    try{
        let data = req.body
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Field Can't Empty.Please Enter Some Details" })

        // Title Validation
        if(!isValid(data.title)) return res.status(400).send({status: false, message: "Title is Required.." })
        
        const titleCheck = await bookModel.findOne({title: data.title})
        if(titleCheck) return res.status(400).send({status: false, message: "This Title Already Exists.." })

        // Excerpt Validation
        if(!isValid(data.excerpt)) return res.status(400).send({status: false, message: "Excerpt is Required.." })

        // userId Validation
        if(!isValid(data.userId)) return res.status(400).send({status: false, message: "User ID is Required.." })

        let userExists = await userModel.findById(data.userId)
        if(!userExists) return res.status(404).send({status: false, message: "User ID Not Found" })

        if(!isValid(data.ISBN)) return res.status(400).send({status: false, message: "ISBN is Required.." })
        
        let checkISBN = await bookModel.findOne({ISBN: data.ISBN})
        if(checkISBN) return res.status(400).send({status: false, message: "ISBN already exists, please enter anothor ISBN" })

        if(!isValid(data.category)) return res.status(400).send({status: false, message: "Category is Required.." })

        if(data["subcategory"].length == 0) return res.status(400).send({status: false, message: "Subcategory is Required.." })

        if(!isValid(data.releasedAt)) return res.status(400).send({status: false, message: "Released Date is Required.." })

        if(isValidDate(data.releasedAt)) return res.status(400).send({status: false, message: "Please Enter Valid Date" })

        let bookData = await bookModel.create(data)
        return res.status(201).send({status: true, message: "Success", data: bookData})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}


module.exports = {createBook}