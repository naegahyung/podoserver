const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Comment = mongoose.model('comment');

const postSchema = new Schema({
  userId: String,
  username: String,
  body: String,
  created: Date,
  type: String,
  title: { type: String, default: '' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

mongoose.model('post', postSchema);
  