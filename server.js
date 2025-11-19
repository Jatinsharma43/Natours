const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log('DB connection successful!');
  });

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App runing on port ${PORT}...`);
});
//each time when there is unhandeld rejection somewhere in our application the process object emits a object called unhandled rejection so we can subscribe to that event like
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION ** Shutting down...........');
  server.close(() => {
    process.exit(1);
  });
});
// learn more on server. functions
// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error:', err);
//   });
