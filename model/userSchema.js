//! This is the new model created to store username,password and email of the user loging in on website. Here we are using passport as a package to make the process simple  
const mongoose = require('mongoose')

//* Requiring passport-local-mongoose.

// passport have 3 packages which are interconnected to each other passportjs with passport-local(used for simple username and password login their are 
// many other utilites like google login which can be used as well) and this with passport-local-mongooose to make mongoose database simple to config.
const passportLocalMongoose = require('passport-local-mongoose')

//* Creating Schema for the user
const userSchema = new mongoose.Schema({
    // Here we donot have to add username and password as that is done by passport-local-mongooose plugin and it also verfies wheather username and password is unique
    email:{
        type:String,
        required:true,
        unique:true
    }
})

//* Adding the (passport-local-mongooose) plugin to userSchema  
userSchema.plugin(passportLocalMongoose);

//* Creating the User model.
const User = new mongoose.model("User",userSchema);

//* Exporting the User model.
module.exports = User;




//* In passport-local-mongooose you're free to define your User how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username,
//* the hashed password and the salt value. Additionally, Passport-Local Mongoose adds some methods to your Schema. See the API Documentation section for more details. 