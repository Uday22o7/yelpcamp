//* This file will contain all the func of the campground route to make the campground router spacious and clean.
const Campground = require('../model/yelpCamp')
// Now we need to require cloudinary so that we can delete uploaded images from clodinary
const { cloudinary } = require("../cloudinary/index")

//* For using mapbox geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

//* -----  route to display all campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('./campgrounds/index.ejs', { campgrounds })
}

//* -----  creating a route to display form to fill data about new campground
module.exports.renderNewForm = (req, res) => {
    try {
        res.render('./campgrounds/new.ejs')
    } catch (error) {
        console.error("Error in fetching products:", error);
    }
}


//* -----  creating a post route to create new campground
module.exports.newCampground = async (req, res) => {
    //? The below code is the api that will provide us with langintude and longitude.That we need to store.
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    // if (!req.body.campground) throw new AppError("Invalid campground data", 500)
    const camp = new Campground(req.body)
    // This is where we will add the geoData in the yelpcamp model in geometry field
    // we need to modify it somewhat because Joi is pushing an error so we modifed it to add data properly to specific field
    camp.geometry = {
        type: "Point",
        coordinates: geoData.body.features[0].geometry.coordinates
    };
    // Here we are mapping over it and fetching it out one by one in show page
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.author = req.user._id
    console.log(camp)
    await camp.save()
    //* here we have added the req.flash which will create a message whenever any new campground is created.
    req.flash("success", "We have successfully created Campground")
    res.redirect(`/campground/${camp._id}`)
}

//* -----  creating a show route to display specific campground's details
module.exports.campgroundInfo = async (req, res) => {
    const { id } = req.params
    // here we have to add a property called poopulate to populate the review and author as they only have id.
    const camps = await Campground.findById(id).populate({
        //In this we are populating the reviews but we also want the author added to ech review but it also need to be populated so to do se we need to use the below syntax and commands    
        path: 'reviews',//first it will populate to path reviews.
        populate: {
            path: 'author'//now it will popualte author under path review
        }
    }).populate('author')
    // Here we have added a logic so that when a campground is not found flash a message and redirect to home page.
    if (!camps) {
        req.flash("error", "Error 404 ,can't find the campground.")
        res.redirect("/campground")
    }
    res.render('./campgrounds/show.ejs', { camps })
}

//* -----  creating a route to edit a specific campground
module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    const camps = await Campground.findById(id)
    if (!camps) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('./campgrounds/edit.ejs', { camps })
}

//* -----  creating a patch route to edit a specific campground
module.exports.patchCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findOneAndUpdate({ _id: id }, req.body)
    const imag = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imag);
    //* This query wil pull out the image in that matches with the array in deleteImages from req.body 
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    // Here I have encountered a new problem when I was passing the id from req.param to findOneAndUpdate
    //  it was sent as an string instead of sending as an object due to which the error was caused to solve 
    //  it we have to send the id in _id which will convert the string id into the object and due to this error 
    //  will be resolved

    await campground.save()
    //* Here we have added the req.flash which will create a message whenever any campground is updated.
    req.flash("success", "We have successfully updated Campground")
    res.redirect(`/campground/${campground._id}`)
}


//* -----  creating a route to delete a specific campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}