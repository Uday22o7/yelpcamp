//* This file is created so that the user router file can be made more clean and easy to understand.
const User = require('../model/userSchema')

//* Route created to render the register page. 
module.exports.renderRegisterForm = (req, res) => {
    res.render('./user/register.ejs')
}

//* Post route created to register User. 
module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username });
        // register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique.
        // by using this method it hashes password and add salt to model and make it raedy to save in database. it uses pbkdf2 as the password hashing function
        const registerUser = await User.register(user, password);
        // we will save registerUser as that contain hash password,salt etc. 
        await registerUser.save()
        //! -----------------------------------------------------------------------------------------------------------------------------------------------
        // Passport exposes a login() function on req (also aliased as logIn()) that can be used to establish a login session.
        // When the login operation completes, user will be assigned to req.user.
        // Note: passport.authenticate() middleware invokes req.login() automatically. 
        // This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
        //! -----------------------------------------------------------------------------------------------------------------------------------------------
        req.login(registerUser, (err) => {
            if (!err) {
                // here we have added the req.flash which will create a message whenever any new user is registered.
                req.flash("success", "We have successfully Registered the user")
                res.redirect('/campground')
            }
        })
    } catch (e) {
        req.flash("error", e.message)
        res.redirect('/register')
    }
}

//* This Route created to render the login page. 
module.exports.renderLoginForm = (req, res) => {
    res.render('./user/login.ejs')
}

//* This post route is created to check user login. passport.authenticate middleware add req.login func this func helps us login 
module.exports.loginUser = (req, res) => {
    const redirectUrl = res.locals.returnTo || '/campground'; //this line add the original URl or '/campground' to redirectUrl variable 
    req.flash('success', 'You have logged in successfully.');
    res.redirect(redirectUrl);
}

//* -----  creating a route to logout
module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campground');
    });
}