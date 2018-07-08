const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  publicId: String,
  username: String,
  userId: String,
  created: Date
});

mongoose.model('adminImages', imageSchema);
mongoose.model('images', imageSchema);
