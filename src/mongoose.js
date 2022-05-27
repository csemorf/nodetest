let validator = require('validator');
const mongoose = require('mongoose');
const mongourl = process.env.MONGO_URL;
mongoose.connect(mongourl, {
  useNewUrlParser: true,
  //   useCreateIndex: true,
});
