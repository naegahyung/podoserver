const passport = require('passport');
const mongoose = require('mongoose');
const _ = require('lodash');

const requireToken = passport.authenticate('jwt', { session: false });
const Post = mongoose.model('post');
const Annoucement = mongoose.model('annoucement');
const Comment = mongoose.model('comment');

module.exports = app => {
  app.post('/api/post', requireToken, async (req, res) => {
    const { body, type } = req.body;
    if (!body) {
      res.status(204).send({ error: "body cannot be empty!" });
    }

    try {
      const username = req.user.username;
      const userId = req.user._id;
      const created = new Date();
      const post = new Post({
        userId,
        username,
        body,
        created,
        type
      });

      await post.save();
      res.send({ message: "post has been successfully posted."});
    } catch (e) {
      console.log(e);
    }
  });

  app.get('/api/retrieve/:type', async (req, res) => {
    const posts = await Post.aggregate([
      { $match: { type: req.params.type } },
      { $project: {
        dateCreated: {
          $subtract: [ "$created", 5 * 60 * 60 * 1000]
        },
        body: "$body",
        username: "$username",
        userId: "$userId"
      } },
      { $group : {
        _id: {
            year : { $year : "$dateCreated" },
            month : { $month : "$dateCreated" },
            day : { $dayOfMonth : "$dateCreated" },
        },
        count: { $sum: 1 },
        content: { $push : {
          body: "$body",
          username: "$username",
          created: "$dateCreated",
          id: "$_id",
          userId: "$userId"
        }}
      }},
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 }},
    ]);
    
    res.send(posts);
  });

  app.get('/api/post/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.send(post);
  });

  app.post('/api/general', requireToken, async (req, res) => {
    const created = new Date();
    const username = req.user.username;
    const userId = req.user._id;
    const body = req.body.body;
    const title = req.body.title;

    const newPost = new Post({
      username, userId, body, created, 
      title: title.charAt(0).toUpperCase() + title.slice(1), 
      type: 'general'
    });

    await newPost.save();
    res.send(newPost);
  });

  app.get('/api/general', async (req, res) => {
    const posts = await Post.find({ type: "general" }, {
     username: 1, body: 1, created: 1, title: 1, userId: 1
    }).sort({"created": -1});

    res.send(posts);
  });

  app.get('/api/frontposts', async (req, res) => {
    let latest = await Post.find().sort({ "created": -1 }).limit(7);
    const latestAnnoucement = await Annoucement.find().sort({ "created": -1 }).limit(7);
    let result = latest.concat(latestAnnoucement);
    result = _.sortBy(result, [ p => { return p.created }]).reverse().slice(0, 7);
    res.send(result);
  });

  app.get('/api/annoucements', async (req, res) => {
    const annoucements = await Annoucement.find().sort({ "created": -1 });
    res.send(annoucements);
  });

  app.get('/api/annoucement/:id', async (req, res) => {
    const ann = await Annoucement.findById(req.params.id);
    res.send(ann);
  });

  app.get('/api/sliders', async (req, res) => {
    let sliders = await Annoucement.find({ slider: true });
    res.send(sliders);
  });

  app.patch('/api/post/:id', requireToken, async (req, res) => {
    const idToBeUpdated = req.params.id;
    const infoToUpdate = req.body;
    const user = req.user;

    const toBeUpdated = await Post.findById(idToBeUpdated);
    if (toBeUpdated.userId === String(user._id) && toBeUpdated.username === user.username) {
      const updated = await Post.findByIdAndUpdate(idToBeUpdated, infoToUpdate, { new: true });
      res.send(updated);
    } else {
      res.status(403).send("Failed");
    }
  });

  app.post('/api/post/comment/:id', requireToken, async (req, res) => {
    const idToBeUpdated = req.params.id;
    const newComment = req.body.comment;
    const user = req.user;
    const { username, _id } = user;
    const comment = new Comment({
      body: newComment,
      username,
      userId: _id,
      postId: idToBeUpdated,
      created: new Date()
    });

    await comment.save();
    
    await Post.findByIdAndUpdate(idToBeUpdated, { $push: { comments: comment }}, { new: true });
    res.send(comment);
  });

  app.get('/api/comments/:id', async (req, res) => {
    const idToBeFetched = req.params.id;

    const post = await Post.findById(idToBeFetched);
    const listOfComments = post.comments;

    const comments = await Comment.find({ '_id': { $in: listOfComments }});
    res.send(comments);
  });

  app.delete('/api/comment/:id', requireToken, async (req, res) => {
    const idToBeDeleted = req.params.id;
    const user = req.user;

    const commentToBeDeleted =  await Comment.findById(idToBeDeleted);
    const postId = commentToBeDeleted.postId;
    if (commentToBeDeleted.userId === String(user._id)) {
      await Post.findByIdAndUpdate(postId, { $pull: { comments: idToBeDeleted } });
      await commentToBeDeleted.remove();
      res.send({ id: idToBeDeleted, postId });
    } else {
      res.send("Failed");
    }
  }); 

  app.delete('/api/post/:id', requireToken, async (req, res) => {
    const idToBeDeleted = req.params.id;
    const user = req.user;

    const postToBeDeleted =  await Post.findById(idToBeDeleted);
    console.log(postToBeDeleted)
    if (postToBeDeleted.userId === String(user._id)) {
      await postToBeDeleted.remove();
      res.send(postToBeDeleted);
    } else {
      res.send("Failed");
    }
  });

  app.patch('/api/comment/:id', requireToken, async (req, res) => {
    const idToBeUpdated = req.params.id;
    const user = req.user;
    const updatedBody = req.body.comment;

    const commentToBeUpdated = await Comment.findById(idToBeUpdated);
    if (commentToBeUpdated.userId === String(user._id)) {
      const updatedComment = await Comment.findByIdAndUpdate(idToBeUpdated, { body: updatedBody }, { new: true });
      res.send(updatedComment);
    } else {
      res.send("Failed");
    }
  });
}
