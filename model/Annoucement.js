const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const annoucementSchema = new Schema({
  slider: Boolean,
  image: String,
  body: String,
  title: String,
  created: Date,
});

mongoose.model('annoucement', annoucementSchema);
