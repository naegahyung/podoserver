const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const qtSchema = new Schema({
  verses: [String],
  date: String
});

mongoose.model('QT', qtSchema);
