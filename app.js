const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
//----------------global middleware-------------
app.use(helmet()); //http header
if (process.env.NODE_ENV === 'development') {
  //development logging
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  //middleware-limit request from same api
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!'
});
app.use('/api', limiter); //apply this middleare on /api router.
app.use(express.json({ limit: '10kb' })); //body parser, reading data from the body into req.body
// data sanitization against nosql query injection
//{"email":{"$gt":""},"password":"jatin@123"}--example
app.use(mongoSanitize()); //look at req body and req body string and req params and filter out $ signs;
app.use(xss()); // data saniization against xss
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); //prevent parameter pollution
app.use(express.static(`${__dirname}/public`)); //serving static files
app.use((req, res, next) => {
  //test middleware
  req.requestTime = new Date().toISOString();
  next();
});
//--------------------Routes-----------------
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//------middleware runs after the above two lines
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
// when a user hits a url that doesn't exist we can consider it as operational url
app.use(globalErrorHandler);
module.exports = app;
// if we pass error in the next it skip all middleware and go straight to the global error middleware
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/////////////////////////////////////////////////////////////////////////////////////////////
// app.all('*', (req, res, next) => {
//   // res.status(404).json({
//   //   status: 'fail',
//   //   message: `Can't find ${req.originalUrl} on this server`,
//   // });
//   // const err = new Error(`Can't find ${req.originalUrl} on this server`);
//   // err.status = 'fail';
//   // err.statusCode = 404;
// });
// const app = express();
/////middlewares
// app.use(morgan('dev')); //3rd part middleware //output in console->GET /api/v1/tours 200 6.840 ms - 8577
// app.use(express.json());
// app.use((req, res, next) => {
//   // middleware run in the order they are define //1
//   console.log('hello from the middleware:)');
//   next();
// });
// app.use((req, res, next) => {
//   //2
//   req.requestTime = new Date().toISOString();
//   next();
// });
////////////////////////////////////////////////////////////////////////////////////////////
// app.use('/api/v1/tours', tourRouter); // means we are on route->/api/v1/tours
// app.use('/api/v1/users', userRouter); // this concept called mounting a router
////////////////////////////////////////////////////////////////////////////////////////////
/////////start server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`App runing on port ${PORT}...`);
// });
/////////////////////////////////////////////////////////////////////////////////////////////
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
///////route handlers////////////////////////////////////////////////////////////////////////
// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// };
// const getTour = (req, res) => {
//   const id = req.params.id * 1; //converting id to num
//   const tour = tours.find((el) => el.id === id);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };
// const createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };
// const updateTour = (req, res) => {
//   //for just learning purpose
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { tour: '<updated tour here...>' },
//   });
// };
// const deleteTour = (req, res) => {
//   //for just learning purpose
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   res.status(204).json({
//     //204-no content
//     status: 'success',
//     data: null, // to show data no longer exist
//   });
// };
/////////////////////////////////////////////////////////////////////////////////////////////
// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };
// const getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };
// const createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };
// const updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };
// const deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };
////////////routes///////////////////////////////////////////////////////////////////////////

// const tourRouter = express.Router();
// const userRouter = express.Router();
////////////////////////////////////////////////////////////////////////////////////////////
// tourRouter.route('/').get(getAllTours).post(createTour); //default route within->/api/v1/tours
// tourRouter //another route within->/api/v1/tours
//   .route('/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);
////////////////////////////////////////////////////////////////////////////////////////////
// userRouter.route('/api/v1/users').get(getAllUsers).post(createUser);
// userRouter
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);
/////////////////////////////////////////////////////////////////////////////////////////////
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );
