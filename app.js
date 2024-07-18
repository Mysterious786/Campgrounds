const express = require('express');
const app = express();
const Joi = require('joi');
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const { createBrotliDecompress } = require('zlib');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync');
const Review =  require('./models/review')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/review')
const db = mongoose.connection;
const session = require('express-session');
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs'); 
app.set('views',path.join(__dirname,'views'));
//parsing body 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
//httponly
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());




// we have deleted review but what if we dlt a whole card review still stays in the database
// we need a monoogse midde ware to dlt this
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})