//* This is the folder with all the cloudinary stuff. We are setting up cloudianry so that we can send media to cloudianry so to do it easily we are using this packages. 

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// This will config the cloudinary with our cloudinary name,key,secret as it can easily add it to our cloudinary account. 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

// Now this will create a new storage so that we can upload the images there and we will add the other options here
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "Yelpcamp",
        allowedFormat: ['jpeg', 'jpg', 'png']
    }
});

module.exports = {
    cloudinary,
    storage
}

// To use the Cloudinary Node.js library, you have to configure at least your cloud_name. An api_key and api_secret are also needed for
// secure API calls to Cloudinary (e.g., image and video uploads). You can find your product environment configuration credentials in the
//  API Keys page of the Cloudinary Console.