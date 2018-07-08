const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  username: String,
  userId: String,
  body: String,
  postId: String,
  created: Date
});

mongoose.model('comment', commentSchema);
