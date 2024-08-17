const mongoose = require('mongoose')
const Campground = require('../model/yelpCamp')

// taking only two properties from the data seedHelpers
const { descriptors, places } = require('./seedHelpers')
// impoting cities
const cities = require('./cities')

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')

// using this instead of .then and and .catch
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// here we are creating a function which will take a array as argument and create a random number in range of array length
// to be passed with array i.e. "array[randNo]" as our database called seedhelper have array of data in it which will be selected randomly
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 100; i++) {
        // create a rand no betn 0 to 1000
        const rand1000 = Math.floor(Math.random() * 1000);
        // create a rand no betn 10 to 50
        const price = Math.floor(Math.random() * 50) + 10;
        const camp = new Campground({
            // as we are creating some demo campground they will not have a author so we added a userid of admin to it so it can be accessed.
            author: '6686e1659ed066996043ac91',
            // database of cities have 1000 different city name,located in an array and each array element is a object containg cityname,state etc they are selected randomly  
            location: `${cities[rand1000].city} , ${cities[rand1000].state}`,
            // This will send argus to the function sample which will create a random array index no to extract data from array
            title: `${sample(descriptors)} ${sample(places)}`,
            // This will add the geometry filed to seed so if the data is send via mapbox api it will have a field present. 
            geometry: {
                type: "Point",
                coordinates: [
                    // we made this change so we donot need to hardcode the coordinates
                    cities[rand1000].longitude,
                    cities[rand1000].latitude
                ]
            },
            // in between we changed the model so that user can upload there images so we also need to change this field
            images: [
                {
                    url: 'https://res.cloudinary.com/dcjtbfnww/image/upload/v1722611158/Yelpcamp/nululnsauiokhfma1hnx.png',
                    filename: 'Yelpcamp/nululnsauiokhfma1hnx',
                }
            ],
            price: price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt in cupiditate ex recusandae, nulla explicabo ut neque, numquam magnam at sint? Dignissimos ut temporibus dolor laudantium repellat odio animi.'
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
    })

// this code is used to create fake data in database in this fake data is created using to files called cities and seedhelper 
