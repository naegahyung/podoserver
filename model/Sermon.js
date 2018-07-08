const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sermonSchema = new Schema({
  created: Date,
  body: String,
  title: String,
  image: String,
  verses: String,
  video: String
});

mongoose.model('sermon', sermonSchema);
