// const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours
//     }
//   });
// });
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //findById(req.params.id)=Tour.findOne({_id:req.params.id})
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });
// });
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //for each element in an array create a separate tour
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //give month in number
        numTourStarts: { $sum: 1 }, // act as a counter
        tours: { $push: '$name' } //push name
      }
    },
    {
      $addFields: { month: '$_id' } //store and display _id value
    },
    {
      $project: {
        _id: 0 //hide _id value
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12 //limit result
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
//-----------------------------------------------------------------------------------------//
/*exports.getAllTours = async (req, res) => {
  try {
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    //---------------------------------
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });
    //{difficulty:'easy',duration:{$gte:5}}--mongo
    //-------------------build query
    //-------------------1)filtering---------------------------------------------------------
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
    // //--------------------2)advance_filtering------------------------------------------------
    // let queryStr = JSON.stringify(queryObj);
    // //{"duration":{"gte":"5"},"price":{"lt":"1500"}}
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //gte=>$gte
    // let query = Tour.find(JSON.parse(queryStr));
    //--------------------3)sorting----------------------------------------------------------
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy); //mongose method
    // } else {
    //   query = query.sort('-createdAt'); //reverse order
    // }
    //-------------------4)limiting----------------------------------------------------------
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v'); //exclude
    // }
    //-------------------5)pagination--------------------------------------------------------
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    //-------------------execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};*/
// query is returned by findbyid,update,create and so on.
// const tours = await Tour.find({--filter
//   duration: 5,
//   difficulty: 'easy',
// });
// const fs = require('fs');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };
// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   next();
// };
// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     // results: tours.length,
//     // data: {
//     //   tours,
//     // },
//   });
// };
// exports.getTour = (req, res) => {
//   const id = req.params.id * 1;
//   // const tour = tours.find((el) => el.id === id);

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour,
//   //   },
//   // });
// };
// exports.createTour = (req, res) => {
//   res.status(201).json({
//     status: 'success',
//     // data: {
//     //   tour: newTour,
//     // },
//   });
// };
