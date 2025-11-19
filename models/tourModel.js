const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal then 40 characters'],
      minLength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points on current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //hide this field in response but works internally
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJson syntax
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        // embeded document
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; //it is only a virtual property so we need to explcitly tell to schema to add it to the output and we also can,t query based on it as it is virtual .it uses function() because it set this to the current document
});
// virtual populate -- learn more about this
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
//------------------------Document middleware------------------------------------------------
//runs before .save() and .create(),this=currently processed data
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// {
//     "status": "success",
//     "data": {
//         "tour": {
//             "startLocation": {
//                 "type": "Point",
//                 "coordinates": []
//             },
//             "ratingsAverage": 4.5,
//             "ratingsQuantity": 0,
//             "images": [],
//             "createdAt": "2025-09-27T08:57:03.201Z",
//             "startDates": [],
//             "secretTour": false,
//             "guides": [
//                 {
//                     "role": "admin",
//                     "_id": "68c96e63bdfb3d1e88888bb0",
//                     "name": "admin",
//                     "email": "jatinsharma1@gmail.com",
//                     "__v": 0,
//                     "passwordChangedAt": "2025-09-23T08:57:43.884Z"
//                 },
//                 {
//                     "role": "user",
//                     "_id": "68c96e8cbdfb3d1e88888bb2",
//                     "name": "jatin",
//                     "email": "jatinsharma0@gmail.com",
//                     "__v": 0
//                 }
//             ],
//             "_id": "68d7a7a63164bb21a869eda0",
//             "name": "The Test Tour",
//             "maxGroupSize": 1,
//             "difficulty": "easy",
//             "duration": 1,
//             "price": 200,
//             "summary": "test tour",
//             "imageCover": "tour-3-cover.jpg",
//             "locations": [],
//             "slug": "the-test-tour",
//             "__v": 0,
//             "durationWeeks": 0.14285714285714285,
//             "id": "68d7a7a63164bb21a869eda0"
//         }
//     }
// }
// tourSchema.pre('save', function (next) {
//   console.log("saving document")
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc)
//   next();
// });
//--------------------- Query middleware-----------------------------------------------------
// this=current query
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});
tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`); //query executed
  // console.log(docs);
  next();
});
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

//------------------------------ aggregation middleware--------------------------------------
//this=aggregation object,this.pipeline()
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
