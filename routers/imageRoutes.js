const passport = require('passport');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary');
const mongoose = require('mongoose');
const exec = require('child_process').exec;

const upload = multer({ dest: 'uploads/' });
const Image = mongoose.model('images');
const AdminImage = mongoose.model('adminImages');
const requireToken = passport.authenticate('jwt', { session: false });

cloudinary.config({
  cloud_name: 'dwxarixhf',
  api_key: '993348213416836',
  api_secret: process.env.CLOUDINARY_SECRET
});

module.exports = app => {
  app.post('/api/uploadimages', requireToken, upload.array('images'), async (req, res) => {
    let publicIds = [];
    
    for (let file of req.files) {
      try {
        let result = await cloudinary.uploader.upload(file.path);
        publicIds.push(result.public_id);
        let newImage = new Image({
          publicId: result.public_id,
          username: req.user.username,
          userId: req.user._id,  
          created: new Date()
        });

        await newImage.save();
        exec('rm -f ./uploads/*', (err, stdout, stderr) => {
          res.send(newImage);
        })
      } catch (e) {
        console.log('Failed to upload!');
      }
    }
  });

  app.post('/api/admin/uploadimages', requireToken, upload.array('images'), async (req, res) => {
    let images = [];
    let counter = 0;
    for (let file of req.files) {
      try {
        let result = await cloudinary.uploader.upload(file.path);
        exec('rm -f ./uploads/*', async (err, stdout, stderr) => {
          let newAdminImage = new AdminImage({
            publicId: result.public_id,
            username: 'admin',
            userId: '',
            created: new Date()
          });
          images.push(newAdminImage);
          await newAdminImage.save();
          counter++;
          if (counter === req.files.length) {
            res.send(images);
          }
        })
      } catch (e) {
        console.log('Failed to upload!');
      }
    }
  });

  app.get('/api/admin/nopublic/images', requireToken, async (req, res) => {
    if (req.user.status !== 'admin') {
      res.status(403).send('Failed');
    }

    const images = await AdminImage.find();
    res.send(images);
  });

  app.delete('/api/admin/image/:id/:publicId', requireToken, async (req, res) => {
    if (req.user.status !== 'admin') {
      res.status(403).send("Failed");
    }
    cloudinary.uploader.destroy(req.params.publicId, { invalidate: true });
    const idToBeDeleted = req.params.id;
    const data = await AdminImage.findByIdAndRemove(idToBeDeleted);
    res.send(data);
  })

  app.get('/api/images', async (req, res) => {
    try {
      const images = await Image.find();
      res.send(images);
    } catch (e) {
      console.log(e);
    }
  });

  app.delete('/api/public/image/:id', requireToken, async (req, res) => {
    const imageToBeDeleted = await Image.findById(req.params.id);
    if (req.user._id !== imageToBeDeleted.userId) {
      cloudinary.uploader.destroy(imageToBeDeleted.publicId, { invalidate: true });
      const data = await imageToBeDeleted.remove();
      res.send(data);
    } else {
      res.status(403).send("Failed");
    }
  });
};
