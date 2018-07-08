const passport = require('passport');
const mongoose = require('mongoose');

const requireToken = passport.authenticate('jwt', { session: false });
const Sermon = mongoose.model('sermon');

module.exports = app => {
  app.post('/api/sermon', requireToken, async (req, res) => {
    const { body, title, image, verses, video } = req.body;

    const created = new Date();

    const newSermon = new Sermon({
      body,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      created,
      image,
      verses,
      video
    });

    await newSermon.save();

    res.send(newSermon);
  });

  app.delete('/api/sermon/:id', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not allowed' });
    }
    
    let idToBeDeleted = req.params.id;
    const data = await Sermon.findByIdAndRemove(idToBeDeleted);
    res.send(data);
  });

  app.patch('/api/sermon/:id', requireToken, async (req, res) => {
    const user = req.user;
    if (user.status !== 'admin') {
      res.status(403).send({ error: 'Not enough adminsitrator previledges'});
    }

    let idToBeUpdated = req.params.id;
    const infoToBeUpdated = req.body;
    
    const data = await Sermon.findByIdAndUpdate(idToBeUpdated, infoToBeUpdated, { new: true });
    res.send(data);
  });

  app.get('/api/sermon/:id', async (req, res) => {
    const sermon = await Sermon.findById(req.params.id);
    res.send(sermon);
  });

  app.get('/api/sermons', async (req, res) => {
    const sermons = await Sermon.find().sort({ created: -1 }).exec();

    res.send(sermons);
  });

  app.get('/api/frontsermons', async (req, res) => {
    const latest = await Sermon.find().sort({ created: -1 }).limit(2).exec();
    res.send(latest);
  });
  
}
