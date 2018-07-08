const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const app = express();
require('dotenv').config()
const DATABASE_URL = process.env.DATABASE_URL;

mongoose.connect(DATABASE_URL);
require('./model');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
require('./services/passport');

require('./routers/signUp')(app);
require('./routers/signIn')(app);
require('./routers/postRoutes')(app);
require('./routers/qtRoutes')(app);
require('./routers/sermonRoutes')(app);
require('./routers/imageRoutes')(app);
require('./routers/adminRoute')(app);


app.use(express.static('client/build/static'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port);
