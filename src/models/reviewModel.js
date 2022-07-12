const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: ObjectId,
    required: true,
    ref: "Book",
  },
  reviewedBy: {
    type: String,
    required: true,
    default: "Guest",
    trim: true,
  },
  reviewedAt: {
    type: Date,
    required: true,
    default: Date.now()
  },
  rating: {
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 5,
  },
  review: {
    type: String,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Review", reviewSchema);