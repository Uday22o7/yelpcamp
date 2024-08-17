const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Review = require('./review')
const { ref, string } = require('joi')

//! We didnot use this because we were directly able to display the image with a specific width and height look at edit form for more info
//! In lecture they direcly use url to create a image of a perticular size below is the ex that we need to add "w_300" in url for width=300
// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png
//? Creating a sepreate schema and adding in a another pre-existing schema. 
// const ImageSchema = new Schema({
//     url: String,
//     filename: String
// });

//? This is a new func in which we are creating a virtual method that does not store any url but compute it every time it is required. 
// ImageSchema.virtual('thumbnail').get(function () {
//     return this.url.replace('/upload', '/upload/w_200');
// });

//? mongoose donot save the virtual function so we need to use a option to save the value of virtual func
const opts = { toJSON: { virtuals: true } };

const campGroundSchema = new Schema({
    title: {
        type: String
    },
    price: {
        type: Number
    },
    //* images: [ImageSchema], add this if using lecture method
    // We have added a array in images so that we can add multiple images in array with object specified with their filename and url
    images: [
        {
            url: String,
            filename: String
        }
    ],
    //* This field is specifily created to accept the geoData.GeoData is the standartize form of data transmitted when transmitting data related to coordiantes and maps  
    //* Geodata contains the 2 object one is type(type is always equal to Point) and coordinates which is array of long,latitude.
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    // using one to many mongo relation as one campground will have many reviews so we are adding square brackets around it to make a array of reviewid
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    // We are adding the userid of the user to the campground model. When a new campground is created, so that only the user have the permission to edit/delete the campground
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts);

// ? Here we have added a virtual method to the campground schema this virtual method will add the text to the field called popupText
campGroundSchema.virtual('properties.popupText').get(function () { //Here we are able to add a anchor tag to get redirected to particular campground.
    return `<a href="/campground/${this._id}" > ${this.title} </a>
    <p>${this.description.substring(0,20)}....</p>`;// we are also able to add the description
});

campGroundSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
})

const Campground = new mongoose.model('Campground', campGroundSchema)

module.exports = Campground;

// This code is schema created for the campground