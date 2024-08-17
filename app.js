if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStatergy = require('passport-local')
const User = require('./model/userSchema')
//* ---- used for increaseing web security and preventing from attacks  
const helmet= require("helmet")

//* ---- Now we are requiring the package that will help us to store the session data in our database(yelpcamp) or in a different database 
const MongoStore = require('connect-mongo')(session); // We have to add this (session) function at the last because we are using the old version of connect-mongo

//* ----This is included to protect the nosql injection attack perform by hackers
const mongoSanitize = require('express-mongo-sanitize');

//* ---- This will remove any $ or period from query string , req.body etc and not record it due to this hackers will not be able to pass the injection in database
app.use(mongoSanitize());

//* ---- This will add all the 11 func of helmet for more info read docs
app.use(
    helmet({
      contentSecurityPolicy: false // for now we have turned off content security option as it was causing problem for us by not allowing images or map to load.
    })
)

//!--------------------------------------We cannot add this code as this destroy our bootstrap And I don't know why --------------------------------------- 

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
//     "https://code.jquery.com/jquery-3.6.3.min.js"
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dcjtbfnww/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

//!---------------------------------------------------------------------------------------------------------------------------------------------------- 

//* ----- Here we are requiring campground router
const campgroundRoutes = require('./routes/campground')
//* ----- Here we are requiring review router
const reviewRoutes = require('./routes/review')
//* ----- Here we are requiring user router
const userRoutes = require('./routes/user')

//* ----- Here we are requiring the url That we will need to connect to the Atlas Database that is the Mongodb cloud database used for production 
//? uncomment this when going for production as it have the url to connect to mangodb cloud 
// const dburl = process.env.DB_URL 

const dburl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelpcamp"  //this is our localhost database connection url

//* ----- To connect to the mongodb 
mongoose.connect(dburl)
    .then(() => {
        console.log('mongo Connection is successful');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });


//* ----- this is created to add views engine with ejs 
app.set('view engine', 'ejs')

//* ----- this is created to add absolute path 
app.set('views', path.join(__dirname, 'views'));

//* ----- setting ejs to ejs-mate
app.engine('ejs', ejsMate)

//* ----- setting up public folder for providing files like css
app.use(express.static(path.join(__dirname, 'public')))

//* ----- middleware to parse the req.body as it is encoded
app.use(express.urlencoded({ extended: true }));

//* ----- middleware for method-override
app.use(methodOverride('_method'))

//* This is so that the secret can be changed in production
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

//* ----- Now here we are, creating a new store in which we will store the session data but instead of the default memorystore it will be stored in the same database as our campgrounds,users,etc are stored but will be stored in a different collection called sessions check in mongosh if needed
// Data will be stored only when you log in as session id is only created when you log in. So first login and then check in mongosh 
const store = new MongoStore({
    url:dburl,
    secret,
    // If Changes are made in session save it instantly But if a user is refreshing continuously, save it after a specific time
    touchAfter: 24*60*60 //this is in second
}) 

//? The .on() function in JavaScript is used to add event listeners to elements or objects, allowing you to execute specific functions when certain events occur.
//? It's commonly used with libraries like jQuery, Node.js, and other event-driven systems. (selector).on(event, childSelector, data, function)


store.on("error",(e)=>{
    console.log("sessionStore error",e)
})

//* ----- middleware for session 
const sessionConfig = {
    // Now, by adding this store In the session config we are storing the data in the store not the default memory store
    store,
    name: 'yelpcamp_SID',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true, we need this faeture as it makes http to https but we are at localhost and localhost is http so we will uncomment it when we deploy the app    
        // Date.now gives date in milesecond so we add time to it according with ms so 1000ms(1s) * 60(60s) * 60(60min) *24(24hr) = 1day
        expires: Date.now + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}
app.use(session(sessionConfig))

//* ----middleware used for passport
// passport.intialize (is used to intialize passport) and passport.session (is used if your application uses persistance login session like asking to login on each request)    
// This middleware should be after session middleware. 
app.use(passport.initialize())
app.use(passport.session())

//* passport method explained below
passport.use(new localStatergy(User.authenticate()))
//! -----------------------------------------------------------------------------------------------------------------------------------------------
//* Breakdown:
// 1) passport: This refers to the Passport.js library, which provides a robust framework for handling user authentication in your application.
// 2) .use( ... ): This is a method provided by Passport that allows you to register an authentication strategy. A strategy defines how users will 
//    be authenticated in your application.
// 3) new localStrategy( ... ): This creates a new instance of the LocalStrategy class, which is part of the passport-local module 
//    (usually installed separately). It's specifically designed for username and password-based authentication.

//* Missing Part:
// User.authenticate(): This part is incomplete. It's likely meant to be a reference to a function you've defined elsewhere in your code. This function
// is responsible for the core logic of verifying the username and password provided by the user during login. It typically interacts with your user data store (e.g., database) 
// to retrieve user information and compare the entered credentials against the stored data.

// .authenticate is the static method added to the database via plugin(passport-local-mongoose)
//! -----------------------------------------------------------------------------------------------------------------------------------------------
// This method tell passport how to add user to session and how to remove user from session this are also static method.
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//* ----- middleware for flash message
app.use(flash())
//* ----- this is not perticularly a middleware for flash it is a middleware that allows you to store variables that can be accessed by your templates and other middleware functions.. 
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//* ----Example route to create user before register form
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'uday@gmail.com', username: 'uday' });
//     // register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique.
//     // by using this method it hashes password and add salt to model and make it raedy to save in database. it uses pbkdf2 as the password hashing function
//     const newUser = await User.register(user, 'password')
//     res.send(newUser)
// })


//* ----- middleware for campground router
app.use('/campground', campgroundRoutes)

//* ----- middleware for review router
app.use(reviewRoutes)
// Instructor used this path as a prefix in app.use so by doing this we can not access the :id in router so to access it in router we will use mergeParams:true in [const router = express.Router()]
// app.use('/campgrounds/:id/reviews', reviews)

//* ----- middleware for review router
app.use(userRoutes)

//* ----- route to render home page
app.get('/', (req, res) => {
    res.render("./campgrounds/home.ejs")
})

app.all('*', (req, res, next) => {
    next(new AppError("Not Found", 404))
})

//* -----  this is a custom error handler middleware that we have created which will accpect all the error when send.this is the handler which will handle async error  
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "something went wrong.."
    res.status(statusCode).render('error', { err })
    console.log(err.name)
})

//* ---- Here we are specifiying the port so that if should take deafualt port of the deployment app or be on localport 
const port = process.env.PORT ||  '4000'

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})