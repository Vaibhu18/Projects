const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const moment = require("moment");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
      trim: true,
    },
    ISBN: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subcategory: {
      type: [String],
      required: true,
      trim: true,
      lowercase: false,
    },
    reviews: {
      type: Number,
      default: 0,
      required: true,
    },
    deletedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    releasedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
