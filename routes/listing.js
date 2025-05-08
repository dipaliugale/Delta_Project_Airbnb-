const express = require("express")
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");



//Index Route
router.get("/", wrapAsync(async (req, res) => {
  console.log(req.user);
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));

//new Route
router.get("/new",isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});


//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: {
    path: "author",
  },
})
  .populate("owner");
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
 })
);


//Create Route
// router.post("/",
//   validateListing,
//   wrapAsync(async (req, res, next) => {
//     let result = listingSchema.validate(req.body);
//     console.log(result);
//     if(result.error) {
//       throw new ExpressError(400,result.error);
//     }
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
//   })
// );

// Create Route
router.post("/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if (result.error) {
    //   throw new ExpressError(400, result.error);
    // }

// Set default image if not provided
if (!req.body.listing.image || !req.body.listing.image.url) {
      req.body.listing.image = {
        filename: "default",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
      };
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings"); 
})
);

module.exports = router;