const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
// const moment = require('moment')
const reviewModel = require("../models/reviewModel")

const isValid = function (value) {
    if ( value === "undefined" || value === null) return false
    if (typeof value !== "string" || value.trim().length === 0) return false
    return true
}

// const isValidDate = (d) => moment(d, 'YYYY-MM-DD', true).isValid()

const createBook = async function(req, res){
    try{
        let data = req.body
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Field Can't Empty.Please Enter Some Details" })

        //authorization
        if(req.headers["userId"] !== data.userId.toString()) return res.status(403).send({ status: false, message: "You are not authorized...." })

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

        if(!(/^(\d{13}|\d{17})?$/).test(data.ISBN)) return res.status(400).send({status: false, message: "ISBN is not Valid" })
        
        let checkISBN = await bookModel.findOne({ISBN: data.ISBN})
        if(checkISBN) return res.status(400).send({status: false, message: "ISBN already exists, please enter anothor ISBN" })

        if(!isValid(data.category)) return res.status(400).send({status: false, message: "Category is Required.." })

        if(data["subcategory"].length == 0) return res.status(400).send({status: false, message: "Subcategory is Required.." })

        if(!data.releasedAt) return res.status(400).send({status: false, message: "Released Date is Required.." })

        if(data.isDeleted) data.deletedAt = new Date().toISOString();
        
        let bookData = await bookModel.create(data)
        return res.status(201).send({status: true, message: "Success", data: bookData})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

const getBooksByFilter = async function(req, res){
    try{
        let data = req.query
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "No Filter Found" })
        
        let filter ={
            isDeleted: false
        }

        if (data.subcategory) {
            data.subcategory = { $in: data.subcategory.split(',') }
        }

        filter['$or'] = [
            { userId: data.userId},
            { category: data.category },
            { subcategory: data.subcategory }
        ]

        let bookData = await bookModel.find(filter).select({_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1}).sort({"title": 1})

        if(bookData.length == 0) return res.status(404).send({status: false, message: "No Such Book Exists.."})

        return res.status(200).send({status: true, message: "Book List", data: bookData})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

const getBookByParams = async function(req, res){
    try{
        let id = req.params.bookId 

        let checkBookIsPresent = await bookModel.findOne({_id: id, isDeleted:false})
        if(!checkBookIsPresent) return res.status(404).send({ status: false , message: "No Such Book Found" })

        let resultObject = {
            _id: checkBookIsPresent._id,
            title: checkBookIsPresent.title,
            excerpt: checkBookIsPresent.excerpt,
            userId: checkBookIsPresent.userId,
            category: checkBookIsPresent.category,
            subcategory: checkBookIsPresent.subcategory,
            isDeleted: checkBookIsPresent.isDeleted,
            reviews: checkBookIsPresent.reviews,
            releasedAt: checkBookIsPresent.releasedAt,
            createdAt: checkBookIsPresent.createdAt,
            updatedAt: checkBookIsPresent.updatedAt 
        }
        
        let review = await reviewModel.find({bookId: id, isDeleted:false})
        resultObject["reviewsData"] = review

        return res.status(200).send({status: true, message: "Book List", data: resultObject})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

const updateBookById = async function(req, res){
    try{
        let id = req.params.bookId

        let data = req.body
        if(Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Enter Data to Update" })
        
        let checkBookIsPresent = await bookModel.findOne({_id: id, isDeleted:false})
        if(!checkBookIsPresent) return res.status(404).send({ status: false , message: "No Such Book Found" })

        //authorization
        if(req.headers["userId"] !== checkBookIsPresent.userId.toString()) return res.status(403).send({ status: false, message: "You are not authorized...." })
        

        let checkTitlePresent = await bookModel.findOne({title: data.title})
        if(checkTitlePresent) return res.status(400).send({ status: false, message: "This Title Already Exists, Please Provide Another Title"})

        let checkISBNPresent = await bookModel.findOne({ISBN: data.ISBN})
        if(checkISBNPresent) return res.status(400).send({ status: false, message: "This ISBN Already Exists, Please Provide Another ISBN"})

        let update={}

        if(data.title) update.title = data.title;
        if(data.excerpt) update.excerpt = data.excerpt;
        if(data.releasedAt) update.releasedAt = data.releasedAt;
        if(data.ISBN) update.ISBN = data.ISBN;

        let result = await bookModel.findOneAndUpdate({_id: id}, update, {new: true})

        return res.status(200).send({status: true, message: "Success", data: result})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

const deleteBookById = async function(req, res){
    try{
        let id = req.params.bookId

        let checkBookIsPresent = await bookModel.findOne({_id: id, isDeleted:false})
        if(!checkBookIsPresent) return res.status(404).send({ status: false , message: "No Such Book Found" })

        //authorization
        if(req.headers["userId"] !== checkBookIsPresent.userId.toString()) return res.status(403).send({ status: false, message: "You are not authorized...." })

        deletedTime= new Date().toISOString();

        await bookModel.findByIdAndUpdate({_id: id},{ isDeleted: true, deletedAt: deletedTime })

        res.status(200).send({ status: true, message: "Book Deleted Successfully"})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

module.exports = {createBook, getBooksByFilter, getBookByParams, updateBookById, deleteBookById}