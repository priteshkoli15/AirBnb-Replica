if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({ 
    mongoUrl: dbUrl, 
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
 });

 store.on("error" , ()=> {
    console.log("ERROR in MONGO SESSION STORE", err);
 });

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};


//Root path
// app.get("/" , (req ,res) => {
//     res.send("Hi , I am Root");
// });


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req , res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "sigma-student",
//     });
//     let registeredUser = await User.register(fakeUser , "helloworld");
//     res.send(registeredUser);
// });


//using listings.js file (Router)
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews" , reviewRouter)
app.use("/" , userRouter);


//For path handling that doesn't exists
app.use((req ,res , next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req ,res ,next)=>{
    let { statusCode = 500 , message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs" , {message});
    // res.status(statusCode).send(message);
});

app.listen(3000 , ()=> {
    console.log("Server is on port 3000");
});

// app.post("/listings/:id/reviews" , async (req,res)=>{
//    let listing = await Listing.findById(req.params.id);
//    let newReview = new Review(req.body.review);

//    listing.reviews.push(newReview);

//    await newReview.save();
//    await listing.save();

//    console.log("new review saved");
//    res.send("new review saved");

//    console.log(res);
// });

// app.get("/testListing" , async (req , res)=> {
    //     let sampleListing = new Listing({
    //         title : "My New Villa",
    //         description : "By the Beach",
    //         price : 1200 , 
    //         location : "Calangute , Goa",
    //         country : "India"
    //     });
    
    //     await sampleListing.save();
    //     console.log("sample was saved");
    //     res.send("successfull testing")
    // });


// MUST be the last route
// app.use((req, res) => {
//     res.status(404).send("Page not found");
// });