const fs = require('fs');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

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
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// import data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data succesfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
// delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data succesfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
