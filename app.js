const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");

const MONGO_URL = "mongodb+srv://soumyadb:Soumya123@freecluster.yk1ijab.mongodb.net/wanderLust";


// ============================
// MongoDB Connection
// ============================

main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}


// ============================
// App Configuration
// ============================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ============================
// Session Configuration
// ============================

const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());


// ============================
// Passport Setup
// ============================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Flash messages middleware

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// ============================
// Root Route
// ============================

app.get("/", (req, res) => {
    res.redirect("/listings");
});


// ============================
// SIGNUP ROUTES
// ============================

app.get("/signup",(req,res)=>{
    res.render("listings/signup");


});


app.post("/signup", async (req,res,next)=>{

    try{

        let {username,email,password} = req.body;

        const newUser = new User({
            email,
            username
        });

        const registeredUser = await User.register(newUser,password);

        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to WanderLust!");
            res.redirect("/listings");
        });

    }catch(err){

        req.flash("error",err.message);
        res.redirect("/signup");

    }

});


// ============================
// LOGIN ROUTES
// ============================

app.get("/login",(req,res)=>{
    

});


app.post("/login",
passport.authenticate("local",
{
    failureRedirect:"/login",
    failureFlash:true
}),
async(req,res)=>{

    req.flash("success","Welcome back!");
    res.render("listings/login");


});


// ============================
// LOGOUT ROUTE
// ============================

app.get("/logout",(req,res,next)=>{

    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully");
        res.redirect("/listings");
    });

});


// ============================
// LISTING ROUTES
// ============================


// Index Route
app.get("/listings", async (req, res) => {

    const allListings = await Listing.find({});

    res.render("listings/index.ejs",{allListings});

});


// New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});


// Show Route
app.get("/listings/:id", async(req,res)=>{

    let {id} = req.params;

    const listing = await Listing.findById(id).populate("reviews");

    if(!listing){
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs",{listing});

});


// Create Route
app.post("/listings", async(req,res)=>{

    let listingData = req.body.listing;

    if(!listingData.image){
        listingData.image = {};
    }

    if(!listingData.image.url){
        listingData.image.url =
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
    }

    const newListing = new Listing(listingData);

    await newListing.save();

    req.flash("success","New Listing Created");

    res.redirect("/listings");

});


// Edit Route
app.get("/listings/:id/edit", async(req,res)=>{

    let {id} = req.params;

    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});

});


// Update Route
app.put("/listings/:id", async(req,res)=>{

    let {id} = req.params;

    await Listing.findByIdAndUpdate(id,{...req.body.listing});

    req.flash("success","Listing Updated");

    res.redirect(`/listings/${id}`);

});


// Delete Route
app.delete("/listings/:id", async(req,res)=>{

    let {id} = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success","Listing Deleted");

    res.redirect("/listings");

});


// ============================
// REVIEW ROUTES
// ============================


// Create Review
app.post("/listings/:id/reviews", async(req,res)=>{

    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success","Review Added");

    res.redirect(`/listings/${req.params.id}`);

});


// Delete Review
app.delete("/listings/:id/reviews/:reviewId", async(req,res)=>{

    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id,{
        $pull:{reviews:reviewId}
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success","Review Deleted");

    res.redirect(`/listings/${id}`);

});


// ============================
// Server
// ============================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Server is listening on port", PORT);
});
