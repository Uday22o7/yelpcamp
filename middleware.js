const { campgroundSchema } = require('./validationSchema');
const Campground = require('./model/yelpCamp')
const Review = require('./model/review')
const AppError = require('./utilites/AppError')
const { reviewSchema } = require('./validationSchema');

//* The returnTo/Redirect Issue

// due to some recent security improvements in the Passport.js version , the session now gets cleared after a successful login.This causes a problem with our returnTo redirect logic because 
// we store the returnTo route path in the session, which gets cleared after a successful login.This is due tto passport.authenticate middleware so we need to add our fix before it. 

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
// We need to export storeReturnTo Even though we have added returnTo in res.locals, because we still need storeReturnTo middleware to run before
// and add the session.returnTo value to local.returnTo as the session.returnTo value will get clear after passport.authentication middleware is used.


//* -----  this func is created to validate campground 
module.exports.validateCampground = (req, res, next) => {
    // campgroundSchema is a const which required joi in app.js to use joi we use .validate on data campgroundSchema.validate(req.body)
    // this validate req.body w.r.t campgroundSchema which is joi in validateschema file is any schema is not matched error is send which is then handled  
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // AppError is used when we can predict the error 
        throw new AppError(msg, 400)
    }
    else {
        next()
    }
}

//* ----- this func is created to check the author of the campground and allow only the author to make changes.
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const camps = await Campground.findById(id)
    // camps have a author attached to it in model and there is a req.user method after a user login.
    if (!camps.author.equals(req.user._id)) {
        req.flash('error', 'You donot have the permission.')
        res.redirect(`/campground/${id}`)
    }
    next()
}

//* ----- this func is created to check the author of the review and allow only the author to make changes.
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    // camps have a author attached to it in model and there is a req.user method after a user login.
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You donot have the permission.')
        res.redirect(`/campground/${id}`)
    }
    next()
}

//* ----- This is created to validate review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        // AppError is used when we can predict the error 
        throw new AppError(msg, 400);
    } else {
        next();
    }
};
