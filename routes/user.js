// * Here we are creating a router for review routes to make the app.js cleaner.
const express = require('express')
const router = express.Router()
//* Adding the user model.
const User = require('../model/userSchema')
//*requiring async error handler to handle any error 
const catchAsync = require('../utilites/catchAsync')
//* requiring passport
const passport = require('passport')
//* requiring middleware to check wheather the user is logged or not.
const isLoggedIn = require('../authenticateLoggin')
//* requiring middleware to session.returnTo value to local.returnTo.
const { storeReturnTo } = require('../middleware')
const user = require("../controller/userController")

//* all the func are moved to the another file in controller so that it can be easy to understand.
//* now we are using a another func of router called route which will make this file more clean 

router.route('/register')
    .get(user.renderRegisterForm)//* Route created to render the register page. 
    .post(catchAsync(user.registerUser))//* Post route created to register User. 


router.route('/login')
    .get(user.renderLoginForm)//* This Route created to render the login page. 
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.loginUser)
//* This post route is created to check user login. passport.authenticate middleware add req.login func this func helps us login 

//! -----------------------------------------------------------------------------------------------------------------------------------------------
// passport.authenticate('local'): This specifies that Passport should use the 'local' strategy, which typically means checking a username and password against stored user credentials.

// {failureFlash: true}: This option enables flash messages to be set if authentication fails. Flash messages are temporary messages that can be displayed to the user (e.g., "Invalid username or password").

// {failureRedirect: '/login'}: This option specifies that if authentication fails, the user should be redirected to the '/login' route.
//! -----------------------------------------------------------------------------------------------------------------------------------------------

//! -----------------------------------------------------------------------------------------------------------------------------------------------
// This happens because in the latest versions of Passport.js, the req.logout() method now requires a callback function passed as an argument. 
// Inside this callback function, we will handle any potential errors and also execute the code to set a flash message and redirect the user.
//! -----------------------------------------------------------------------------------------------------------------------------------------------

//* -----  creating a route to logout
router.get('/logout', isLoggedIn, user.userLogout);


module.exports = router