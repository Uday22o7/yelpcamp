//* This file is created so that the review router file can be made more clean and easy to understand.
const Review = require('../model/review')

const Campground = require('../model/yelpCamp')

//* -----  this route is created to take the post request to add review in database 
module.exports.addReview = async (req, res) => {
    const { id } = req.params;
    const { body, rating } = req.body;
    const review = new Review({ body, rating })
    review.author = req.user._id
    const camp = await Campground.findById(id)
    camp.reviews.push(review)
    await review.save()
    await camp.save()
    //* Here we have added the req.flash which will create a message whenever any review is created.
    req.flash("success", "We have successfully created a review.")
    res.redirect(`/campground/${id}`)
}

//* -----  this route is created to delete reviews of specific campground.
module.exports.deleteReview = async (req, res) => {
    // Code in the course is done using a mongo operator called $pull
    const { id, reviewId } = req.params;
    // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    // there was a specific error with me where id was passed as string here instead of a object I don't know why the fuck this happen with me but not him so we have to use {_id:id}
    await Campground.findOneAndUpdate({ _id: id }, { $pull: { reviews: reviewId } });
    // the $pull operator delete anything with  reviewId from reviews object array which is just a array of ids.
    await Review.findByIdAndDelete(reviewId);
    //* Here we have added the req.flash which will create a message whenever any review is deleted.
    req.flash("success", "We have successfully deleted a review.")
    res.redirect(`/campground/${id}`);

    // ---------------------------------------------------------------------------------------------------------------------------------------------
    // This method was created by me but the problem in code is that The main issue is that you're deleting the review from the Review collection
    //  but not updating the Campground document to remove the reference to the deleted review. This can cause inconsistencies in your database. 

    // const id = req.params.reviewId;
    // const iD = req.params.id;
    // await Review.findByIdAndDelete(id)
    // res.redirect(`/campground/${iD}`)
}