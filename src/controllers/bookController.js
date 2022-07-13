const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")
const validation = require("../validation/validate")
const moment = require('moment')


const createBook = async function(req, res){
    try{
        let data = req.body
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Field Can't Empty.Please Enter Some Details" })

        // Title Validation
        if(!validation.isValid(data.title)) return res.status(400).send({status: false, message: "Title is Required.." })
        
        const titleCheck = await bookModel.findOne({title: data.title})
        if(titleCheck) return res.status(400).send({status: false, message: "This Title Already Exists.." })

        // Excerpt Validation
        if(!validation.isValid(data.excerpt)) return res.status(400).send({status: false, message: "Excerpt is Required.." })

        // userId Validation
        if(!validation.isValid(data.userId)) return res.status(400).send({status: false, message: "User ID is Required.." })
        
        if (!validation.isValidObjectId(data.userId)) return res.status(400).send({ status: false, message: "Please enter valid userId" })
        
        //authorization
        if(req.headers["userId"] !== data.userId) return res.status(403).send({ status: false, message: "You are not authorized...." })

        let userExists = await userModel.findById(data.userId)
        if(!userExists) return res.status(404).send({status: false, message: "User ID Not Found" })

        if(!validation.isValid(data.ISBN)) return res.status(400).send({status: false, message: "ISBN is Required.." })

        // Validation for ISBN 10 or 13
        if(!(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i).test(data.ISBN)) return res.status(400).send({status: false, message: "ISBN is not Valid" })
        
        let checkISBN = await bookModel.findOne({ISBN: data.ISBN})
        if(checkISBN) return res.status(400).send({status: false, message: "ISBN already exists, please enter anothor ISBN" })

        if(!validation.isValid(data.category)) return res.status(400).send({status: false, message: "Category is Required.." })

        if(!data.subcategory) return res.status(400).send({status: false, message: "Subcategory is Required.." })

        if(data["subcategory"].length == 0) return res.status(400).send({status: false, message: "Value of Subcategory Should Not Be Empty" })

        if(!data.releasedAt) return res.status(400).send({status: false, message: "Released Date is Required.." })

        if (!moment(data.releasedAt, "YYYY-MM-DD", true).isValid()) return res.status(400).send({ status: false, message: "Please enter Date In YYYY-MM-DD Format" })

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
        if (Object.keys(data).length != 0) {

            let { userId, category, subcategory } = req.query    

            if(!data["subcategory"] && !data["category"] && !data["userId"]){
                return res.status(400).send({ status: false, message: "Don't leave blank value in query" })
            }

            let query = { 
                isDeleted: false 
            }
            
            if (userId) {
                if (userId.trim().length == 0) return res.status(400).send({ status: false, message: "Dont Left userId Query Empty" })

                if (!validation.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please enter valid userId" })
                
                let data = await userModel.findById( userId )
                
                if (!data) return res.status(400).send({ status: false, message: "The userId is invalid" })
                query.userId = userId
            }

            if (category) {
                if (category.trim().length == 0) return res.status(400).send({ status: false, message: "Dont Left Category Query Empty" })
                query.category = category
            }

            if (subcategory) {
                if (subcategory.trim().length == 0) return res.status(400).send({ status: false, message: "Dont Left subcategory Query Empty" })
                query.subcategory = subcategory.trim()
            }

            let bookData = await bookModel.find( query,{ isDeleted: false } ).select({_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1}).sort({"title": 1})

            if (bookData.length == 0) {
                return res.status(404).send({ status: false, message: "No book Found with provided information...Please Check Book Details or The Upper And Lower Cases Of letter" })
            }
            else {
                return res.status(200).send({ status: true, message: "Books list", data: bookData })
            }
        } else{
            let bookData = await bookModel.find({isDeleted: false}).select({_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1}).sort({"title": 1})

            if (bookData.length == 0) {
                return res.status(404).send({ status: false, message: "No book Found with provided information...Please Check Book Details or The Upper And Lower Cases Of letter" })
            }
            else {
                return res.status(200).send({ status: true, message: "Books list", data: bookData })
            }
        }
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

const getBookByParams = async function(req, res){
    try{
        let id = req.params.bookId 

        if (!validation.isValidObjectId(id)) return res.status(400).send({ status: false, message: "Please enter valid BookId" })

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
        
        let review = await reviewModel.find({bookId: id, isDeleted:false}).select({_id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1}) 
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
        if (!validation.isValidObjectId(id)) return res.status(400).send({ status: false, message: "Please enter valid BookId" })

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
        if (!validation.isValidObjectId(id)) return res.status(400).send({ status: false, message: "Please enter valid BookId" })

        let checkBookIsPresent = await bookModel.findOne({_id: id, isDeleted:false})
        if(!checkBookIsPresent) return res.status(404).send({ status: false , message: "No Such Book Found" })

        //authorization
        if(req.headers["userId"] !== checkBookIsPresent.userId.toString()) return res.status(403).send({ status: false, message: "You are not authorized...." })

        deletedTime= new Date().toISOString();

        await bookModel.findByIdAndUpdate({ _id: id }, { isDeleted: true, deletedAt: deletedTime })

        // await reviewModel.updateMany({ bookId: id },{ isDeleted: true })

        res.status(200).send({ status: true, message: "Book Deleted Successfully"})
    }
    catch(err) {
        console.log(err)
        return res.status(500).send({ status: false , message: err.message })
    }
}

module.exports = {createBook, getBooksByFilter, getBookByParams, updateBookById, deleteBookById}