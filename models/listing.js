// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const listingSchema = new Schema({
//     title: {
//          type: String,
//          required : true,
//     },
//     description: String,
//     image: {
//         type: String,
//         set: (v) =>  v === "" ? "https://images.unsplash.com/photo-1720884413532-59289875c3e1?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
//     },
//     price: Number,
//     location: String,
//     country: String,
// });

// const Listing =  mongoose.model("Listing", listingSchema);
// module.exports = Listing;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
  url: {
    type: String,
    default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  }
},

 price: {
  type: Number,
  default: 0
},
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;