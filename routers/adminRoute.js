const passport = require('passport');
const mongoose = require('mongoose');
const requireToken = passport.authenticate('jwt', { session: false });

const User = mongoose.model('user');
const Post = mongoose.model('post');
const Image = mongoose.model('images');
const Annoucement = mongoose.model('annoucement');
const Sermon = mongoose.model('sermon');

module.exports = app => {
  app.get('/api/admin/users', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough administrator privileges'});
    }

    const users = await User.find({
      username: { $ne: 'admin' }
    }).select({
      "password": 0
    })

    res.send(users);
  });

  app.get('/api/admin/posts', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough administrator privileges'});
    }

    const posts = await Post.aggregate([{
        $sort: { created: -1 }
      }, { $group : {
        _id: "$type",
        count: { $sum: 1 },
        posts: { $push : {
          body: "$body",
          username: "$username",
          id: "$_id",
          userId: "$userId",
          created: "$created"
        }}
      },
    }]);
    res.send(posts);
  });

  app.get('/api/admin/images', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough administrator privileges'});
    }

    const images = await Image.find();

    res.send(images);
  });

  app.post('/api/admin/annoucement', requireToken, async (req, res) => {
    const user = req.user;
    const { body, title, image } = req.body;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough administrator privileges'});
    }
    let slider = false;
    if (image) {
      slider = true;
    }

    const annoucement = new Annoucement({
      body,
      slider,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      image,
      created: new Date()
    });

    await annoucement.save();
    res.send(annoucement);
  });

  app.delete('/api/annoucement/:id', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough administrator previledges' });
    }
    let idToBeDeleted = req.params.id;
    try {
      const data = await Annoucement.findByIdAndRemove(idToBeDeleted);
      res.send(data);
    } catch (e) {
      res.send(e);
    }
  });

  app.patch('/api/annoucement/:id', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough adminsitrator previledges'});
    }
    
    let idToBeUpdated = req.params.id;
    const infoToBeUpdated = req.body;
    
    const data = await Annoucement.findByIdAndUpdate(idToBeUpdated, infoToBeUpdated, { new: true});
    res.send(data);
  });
}
