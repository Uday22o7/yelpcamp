// * Here we are creating a router for review routes to make the app.js cleaner.
const express = require('express')
const router = express.Router()
// use double dots as we are in the another folder.
const AppError = require('../utilites/AppError')
const catchAsync = require('../utilites/catchAsync')
const Campground = require('../model/yelpCamp')
const Review = require('../model/review')
// requiring middleware to check wheather the user is logged or not.
const isLoggedIn = require('../authenticateLoggin')
const { validateReview, isReviewAuthor } = require('../middleware.js')
const review = require("../controller/reviewController.js")

// all the func are moved to the another file in controller so that it can be easy to understand
//* -----  this route is created to take the post request to add review in database 
router.post('/campground/:id/reviews', isLoggedIn, validateReview, catchAsync(review.addReview));

//* -----  this route is created to delete reviews of specific campground.
router.delete('/campground/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview))

module.exports = router