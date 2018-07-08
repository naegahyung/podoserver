const mongoose = require('mongoose');
const tokenForUser = require('../services/token');
const User = mongoose.model('user');
const axios = require('axios');

const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?&address=";

module.exports = app => {
  app.post('/api/signup', async (req, res) => {
    let { email, username, password, address, phone } = req.body;
    email = email.toLowerCase();

    if (!email || !username || !password) {
      res.status(422).send({ error: 'All fields must be provided.' });
    }
    
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      res.status(422).send({ error: 'Email is taken.'});
    }

    const existingUsername = await User.findOne({ username }).exec();
    
    if (existingUsername) {
      res.status(422).send({ error: 'username is taken.'});
    }

    const result = await axios.get(`${geocodeUrl}${address}`);
    const { results, status } = result.data;
    if (status === 'OVER_QUERY_LIMIT') {
      res.status(422).send({ error: 'Try again in a few minutes.'});
    }

    if (status !== 'OK') {
      res.status(422).send({ error: 'Address input incorrect.'});
    }

    if (results.length !== 1 ) {
      res.status(422).send({ error: 'Address is not specific enough.'});
    }

    if (results.length === 0) {
      res.status(422).send({ error: 'Address is not found.'});
    }

    if (results[0].address_components.length !== 7) {
      res.status(422).send({ error: 'Incorrect address'});
    }

    const newUser = new User({
      username, password, phone, email,
      address: results[0].formatted_address,
      status: 'user'
    });

    await newUser.save();
    res.send({ token: tokenForUser(newUser) });

  });
};
