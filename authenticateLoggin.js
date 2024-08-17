//* It is a middleware used to verify whether the user is logged in or not before shifting him on some particular routes.
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // this line add a session method called returnTo which hold this originalUrl or url of the path user was before logging in.
        req.flash("error", "Please log in first.")
        return res.redirect('/login')
    }
    next()
}

module.exports = isLoggedIn