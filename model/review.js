const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    body: {
        type: String
    },
    rating: {
        type: Number
    },
    // we are adding the author id to review so that only the person logged in can view the review form.
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Review = new mongoose.model('Review', reviewSchema)
module.exports = Review

// this model is created to apply review system in yelpcamp to do that we will be using mongo relation