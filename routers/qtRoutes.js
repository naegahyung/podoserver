const passport = require('passport');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const requireToken = passport.authenticate('jwt', { session: false });
const QT = mongoose.model('QT');
const Post = mongoose.model('post');
const fetchQT = require('../services/fetchTodayQT');


module.exports = app => {

  app.get('/api/qt/:date', async (req, res) => {
    const date = req.params.date;
    let result = await fetchQT(date);
    result.date = date;
    res.send(result);
  });

  app.get('/api/qtcomments/:date', async (req, res) => {
    let dateStr = new Date(parseInt(req.params.date));
    dateStr.setHours(5,0,0,0);
    
    const comments = await Post.aggregate([
      { $match: {
        type: 'qtcomments',
        created: { $gte: dateStr, $lt: new Date(new Date(dateStr).valueOf()+ 1000*3600*24)}
      }},
      { $group : {
        _id: {
            year : { $year : "$created" },
            month : { $month : "$created" },
            day : { $dayOfMonth : "$created" },
        },
        count: { $sum: 1 },
        content: { $push : {
          body: "$body",
          username: "$username",
          created: "$created",
          title: "$title",
          userId: "$userId",
          _id: "$_id"
        }}
      }},
    ]);

    res.send(comments);
  });

  app.post('/api/qtcomments', requireToken, async (req, res) => {
    const created = new Date();
    const username = req.user.username;
    const userId = req.user._id;
    const body = req.body.body;
    const title = req.body.title;

    const newQT = new Post({
      username, userId, body, created, title, type: 'qtcomments'
    });

    await newQT.save();
    res.send(newQT);
  });

  app.delete('/api/qtcomment/:id', requireToken, async (req, res) => {
    const id = req.params.id;
    const user = req.user;

    try {
      const post = await Post.findById(id).exec();
      if (post.userId === String(user._id) && post.username === user.username) {
        const data = await Post.findByIdAndRemove(id);
        res.send(data);
      } else {
        res.status(500).send('failed');
      }
    } catch (e) {
      res.status(500).send(e);
    }
  });

};
