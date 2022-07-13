const reviewModel = require("../models/reviewModel")
const bookModel = require("../models/bookModel")
const validation = require("../validation/validate")
const moment = require('moment')


const createReview = async function (req, res) {
    try {
        let data = req.body 
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Field Can't Empty.Please Enter Some Review Details" })

        let id = req.params.bookId
        if (!validation.isValidObjectId(id)) return res.status(400).send({ status: false, message: "Please enter valid BookId" })
        
        let checkbookId = await bookModel.findOne({_id: id, isDeleted: false})
        if (!checkbookId) return res.status(404).send({ status: false, message: "No Book Exists With This ID.." })

        if (!data.reviewedBy){ data.reviewedBy = "Guest" }

        // if (!data.reviewedAt){ data.reviewedAt = Date.now() }

        if (!validation.isValidName(data.reviewedBy)) return res.status(400).send({ status: false, message: "Pls Enter Valid reviewer Name only in Alphabet format" })

        if (!data.reviewedAt) return res.status(400).send({ status: false, message: "Please enter Review Date" })

        if (!moment(data.reviewedAt, "YYYY-MM-DD", true).isValid()) return res.status(400).send({ status: false, message: "Please enter Date In YYYY-MM-DD Format" })

        if (!data.rating) return res.status(400).send({ status: false, message: "rating must be required" }); 

        if (typeof data.rating !== "number" || ( data.rating < 1 || data.rating > 5)) return res.status(400).send({ status: false, message: "please enter valid rating in between 1 to 5" })

        // let formatedDate = moment(Date.now())

        let reviewCreated = await reviewModel.create({ reviewedBy: data.reviewedBy, rating: data.rating, review: data.review, reviewedAt: data.reviewedAt, bookId: id })
        
        let bookData = await bookModel.findByIdAndUpdate({ _id: checkbookId._id } ,{ $inc: { reviews: 1 } },{ new: true }) 

        let resultObject = {
            _id: bookData._id,
            title: bookData.title,
            excerpt: bookData.excerpt,
            userId: bookData.userId,
            category: bookData.category,
            subcategory: bookData.subcategory,
            isDeleted: bookData.isDeleted,
            reviews: bookData.reviews,
            releasedAt: bookData.releasedAt,
            createdAt: bookData.createdAt,
            updatedAt: bookData.updatedAt
        }
        
        resultObject.reviewsData = reviewCreated

        return res.status(201).send({ status: true, message: "Success", data: resultObject })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateReviews = async function(req,res){
    try {
        let bookId = req.params.bookId
        if (!validation.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Please enter valid BookId" })

        let reviewId = req.params.reviewId
        if (!validation.isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Please enter valid ReviewId" })

        let data = req.body

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Field Can't Empty.Please Enter Some Valid Details" })

        let checkBookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookData) return res.status(404).send({ status: false, message: "Book Not found. Please Provide Valid Book ID" })

        let checkreviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkreviewId) return res.status(404).send({ status: false, message: "Review Not found. Please Provide Valid Review ID" })

        let update = {} 
        if (data.reviewedBy) update.reviewedBy = data.reviewedBy
        if (data.rating) {
            if (typeof data.rating !== "number" || ( data.rating < 1 || data.rating > 5)) return res.status(400).send({ status: false, message: "please enter valid rating in between 1 to 5" })

            update.rating = data.rating}
        if (data.review) update.review = data.review
          
        let resultObject = {
            _id: checkBookData._id,
            title: checkBookData.title,
            excerpt: checkBookData.excerpt,
            userId: checkBookData.userId,
            category: checkBookData.category,
            subcategory: checkBookData.subcategory,
            isDeleted: checkBookData.isDeleted,
            reviews: checkBookData.reviews,
            releasedAt: checkBookData.releasedAt,
            createdAt: checkBookData.createdAt,
            updatedAt: checkBookData.updatedAt
        }  

        let review = await reviewModel.findOneAndUpdate({ _id: reviewId }, update, { new: true })
        resultObject.reviewData = review

        return res.status(200).send({ status: true, message: "Success", data: resultObject }) 

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteReview =  async function(req,res){ 
    try {
        let bookId = req.params.bookId
        if (!validation.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Please enter valid BookId" })

        let reviewId = req.params.reviewId
        if (!validation.isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Please enter valid ReviewId" })

        let checkBookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookData) return res.status(404).send({ status: false, message: "Book Not found. Please Provide Valid Book ID" })

        let checkreviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkreviewId) return res.status(404).send({ status: false, message: "Review Not found. Please Provide Valid Review ID" })

        if(checkreviewId.bookId != bookId) return res.status(404).send({ status: false, message: "No Such Review Exists With This ID" })

        await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })
        
        await bookModel.findOneAndUpdate({ _id: bookId } ,{ $inc: { reviews: -1 }})
        
        res.status(200).send({ status: true, message: "Review Deleted Successfully" });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createReview, updateReviews, deleteReview }  