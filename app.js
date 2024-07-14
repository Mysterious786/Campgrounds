const express = require('express');
const app = express();
const Joi = require('joi');
const campgroundSchema = require('./schemas.js')
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const { createBrotliDecompress } = require('zlib');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
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

const validateCampground = (req,res,next) =>{
    const campgroundSchema = Joi.object({
        camground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
        }).required()
    }) 
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}



app.get('/',(req,res)=>{
    res.render('home'); 
})
//using JOI for error chcking

app.get('/campgrounds',async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
});
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})
app.post('/campgrounds',validateCampground,catchAsync(async(req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground data',400);
    // defining basic schema using JOI
    // const campgroundSchema = Joi.object({
    //     camground: Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0),
    //         image: Joi.string().required(),
    //         location: Joi.string().required(),
    //         description: Joi.string().required(),
    //     }).required()
    // })
    // const {error} = campgroundSchema.validate(req.body);
    // if(error){
    //     const msg = error.details.map(el => el.message).join(',')
    //     throw new ExpressError(msg,400);
    // }
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
app.get('/campgrounds/:id', catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})
    res.render('campgrounds/show');
}));
//restapi
app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}));

app.put('/campgrounds/:id',validateCampground,catchAsync(async (req,res)=>{
    const {id} = req.params;
   const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
   res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    console.log("deleted"); 
    res.redirect('/campgrounds');

}))

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})


app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!!';
    res.status(statusCode).render('error',{err}); // passing the error 
   
})

app.listen(3000,()=>{
    console.log('Serving on port 3000'); 
});

