const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Jimp = require('jimp');
const jwt = require('jsonwebtoken');
const download = require('image-downloader');
const jsonpatch = require('json-patch');

const secret = require('./config/secret');


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use('/thumbnails', express.static('/thumbnails'));
const protectedRoutes = express.Router();
protectedRoutes.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, secret.secret, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Failed to authenticate token' });
      }
      req.decoded = decoded;
      next();

    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No Token Provided',
    });
  }
});
app.use('/api', protectedRoutes);
// Routes
app.get('/', (req, res) => {
  res.send(`Hello! The API is at http://localhost:${port}`);
});
app.post('/login', (req, res) => {
  const payload = {
    name: req.body.username,
    password: req.body.password,
  };
  const token = jwt.sign(payload, secret.secret, { expiresIn: 60 * 60 * 24 });
  res.json({
    success: true,
    message: 'JWT Token sent',
    token,
  });
});
app.patch('/api/jsonPatch', (req, res) => {
  if (req.body.obj && req.body.patch) {
    let obj = req.body.obj;
    let patch = req.body.patch;
    const jsonPatched = jsonpatch.apply(obj, patch);
    return res.send({ success: true, result: jsonPatched });
  }else{
    return res.send({success:false,message:"No Object or Patch provided"});
  }
});
app.post('/api/createThumbnail', (req, res) => {
  if (req.body.url) {
    const options = {
      url: req.body.url,
      dest: `${__dirname}/thumbnails`,
    };
    download.image(options)
      .then(({ filename, image }) => {
        Jimp.read(filename).then((image) => {
          image.resize(50, 50)
            .write(filename);
          res.send({
            "success": true,
            "image": filename
          })
        }).catch((err) => {
          res.send({
            "success": false,
            "message": err
          })
        });
      }).catch((err) => {
        res.send({
          success: false,
          'message': err,
        });
      });
  } else {
    res.send({
      success: false,
      'message': 'Please enter a link',
    });
  }
});
var port = process.env.PORT || '3000';
app.listen(port, err => (err ? console.log(err) : console.log(`Connected to http://localhost:${port}`)));
module.exports = app;