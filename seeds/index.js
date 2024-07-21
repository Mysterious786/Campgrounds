const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const {places,descriptors} = require('./seedHelpers')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});
//way to pick random elemnt from an array

const sample = (array) => array[Math.floor(Math.random()*array.length)];


const seedDB = async () =>{
    await Campground.deleteMany({});
   for(let i=0;i<50;i++){
    const random1000 = Math.floor(Math.random()*1000);
    const price = Math.floor(Math.random()*20)+10;
    const camp = new Campground({
        author: '669b4b13fc6560fa7d82d50b',
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image:'https://source.unsplash.com/collection/483251',
        description:'Welcome to the Campground buddy!!!',
        price
    })
    await camp.save();
   }
}
seedDB().then(()=>{
    mongoose.connection.close()
})