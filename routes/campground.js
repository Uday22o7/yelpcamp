//! * Here we are creating a router for campground routes to make the app.js cleaner.
const express = require('express')
const router = express.Router()
//* use double dots as we are in the another folder.
const catchAsync = require('../utilites/catchAsync')
const Campground = require('../model/yelpCamp')

//* requiring middleware to check wheather the user is logged or not.
const isLoggedIn = require('../authenticateLoggin')
//* requiring middleware middleware from middleware.js
const { validateCampground, isAuthor } = require('../middleware.js')
const campground = require('../controller/yelpcamp.js')
//*! Multer is a Node.js middleware used for handling multipart/form-data, which is primarily used for uploading files.Multer provides options to customize how and where files are stored (search to find more)
//* first need to install it before requiring it multer is a npm package
const multer = require('multer')
const { storage } = require('../cloudinary') //This will require storage from index.js we didn't need to specify it as node look first for index.js
// const upload = multer({ dest: 'uploads/' }) // we specify destn here whatever we want like cloudinary,aws etc this is beacuse we have not setup any yet
const upload = multer({ storage }) //We have successfully set up cloudinary and create the storage to store images on it.

//*! -----  creating router by replacing app with router
//* we are trying to make the router more clear by tranporting its contains to folder called controller
//* now we are using a another func of router called route which will make this file more clean 

router.route('/')
    .get(catchAsync(campground.index)) //*! -----  route to display all campgrounds
    // we have added the upload.array in post and changed newCampground middleware in controller check it out.
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.newCampground)) //*! -----  creating a post route to create new campground

// now this upload func will do the work of upload as the encoding is different for file uploasd which cannot be handled same as text encode
// there are also different for 1 file upload.single and for multiple upload.array(use req.files with upload.array) but also include filed name
//  as it will handle data from that perticular field. When you use upload.array also include multiple in upload image field in new.ejs 
// req.body: This object contains the text fields submitted through the form. When you submit a form and req.file : This object contains information about the uploaded files


//*! -----  creating a route to display form to fill data about new campground
router.get('/new', isLoggedIn, campground.renderNewForm)

router.route('/:id')
    .get(catchAsync(campground.campgroundInfo))//* -----  creating a show route to display specific campground's details
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.patchCampground))//* -----  creating a put route to edit a specific campground
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))//* -----  creating a route to delete a specific campground

//*! -----  creating a route to edit a specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.editCampground))


module.exports = router