const express = require('express');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const histogram = require('histogram');

const port = process.env.PORT || 3000;
const serverLogPath = path.join(__dirname,'server.log')
var app = express();
var {mongoose} = require('./db/mongoose');
var {Picture} = require('./models/picture');
const {bhattacharyya} = require('./lib/bhattacharyya');
const {euclidean} = require('./lib/euclidean');
const {cosine} = require('./lib/cosine');
const {intersection} = require('./lib/intersection');
const {hamilton} = require('./lib/hamilton');

hbs.registerPartials(path.join(__dirname + '/views/partials'));

app.set('view engine', 'hbs');

app.use( (req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  console.log(log);
  fs.appendFile( serverLogPath , log + '\n', (err) => {
    if(err) {
      console.log('Unable to append to server.log');
    }
  });
  next();
});

app.use(fileUpload());
app.use(express.json());

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

var binning = (array, bins) => {
  var binned = [];
  var valuesToSum = (array.length)/bins;
  for(var i=0; i < bins; i++) {
    binned[i] = 0;
    for(var y=0; y < valuesToSum; y++) {
      binned[i] += array[bins*i+y];
    }
  }
  return binned;
}

app.get('/', (req, res) => {
  res.render('home');
});

app.post('/upload-and-compare', (req, res) => {
  histogram(req.files.photo.data, function (err, data) {
    var rgb_histograms = _.pick(data,['red', 'green','blue']);
    var base64 = new Buffer(req.files.photo.data).toString('base64');
    var sum = rgb_histograms.red.reduce((acc, n) => acc+n, 0);
    var redNorm = rgb_histograms.red.map((x) => x/sum);
    var greenNorm = rgb_histograms.green.map((x) => x/sum);
    var blueNorm = rgb_histograms.blue.map((x) => x/sum);
    var redBin = binning(redNorm, 16);
    var greenBin = binning(greenNorm, 16);
    var blueBin = binning(blueNorm, 16);
    var single_bin = [].concat(...redBin,...greenBin,...blueBin);
    res.send({rgb_histograms, single_bin, base64});
  });
});

app.post('/upload-and-save', (req, res) => {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let photoFile = req.files.photo;
  photoFile.mv(path.join('public','uploads',photoFile.name), function(err) {
    if (err)
      return res.status(500).send(err);

    histogram(photoFile.data, function (err, data) {
      var url = photoFile.name;
      var rgb_histograms = _.pick(data,['red', 'green','blue']);
      var sum = rgb_histograms.red.reduce((acc, n) => acc+n, 0);
      var redNorm = rgb_histograms.red.map((x) => x/sum);
      var greenNorm = rgb_histograms.green.map((x) => x/sum);
      var blueNorm = rgb_histograms.blue.map((x) => x/sum);
      var redBin = binning(redNorm, 16);
      var greenBin = binning(greenNorm, 16);
      var blueBin = binning(blueNorm, 16);
      var single_bin = [].concat(...redBin,...greenBin,...blueBin);
      var picture = new Picture({rgb_histograms, single_bin, url});
      picture.save().then(() => {
        res.send("File Uploaded");
      }, (err) => {
        res.status(500).send("Database Error");
      });
    });
  });
});

app.post('/compare', (req, res) => {
  var distance = req.body.distance;
  var data = req.body.data;
  Picture.find({}).then((pictures) => {
    var method;
    switch(distance) {
      case "bhattacharyya":
        method = bhattacharyya;
        break;
      case "euclidean":
        method = euclidean;
        break;
      case "cosine":
        method = cosine;
        break;
      case "intersection":
        method = intersection;
        break;
      case "hamilton":
        method = hamilton;
        break;
    }
    var forReturn = [];
    _.forEach(pictures, (picture,index) => {
        forReturn.push({
          similarity: method(data, picture.single_bin),
          url: picture['url']
        });
    });
    forReturn.sort(function(a, b){
      if(a.similarity > b.similarity) return -1;
      if(a.similarity < b.similarity) return 1;
      return 0;
  });
    res.send(forReturn);
  }, (err) => {
    res.status(500).send("Database Error");
  });
});

app.listen(port, (err) => {
  if(err) {
    return console.log('Something bad happened', err);
    fs.appendFile( `Something bad happened, ${err}\n`, (err) => {
      if(err) {
        console.log('Unable to append to server.log');
      }
    });
  }
  console.log(`Server is listening on ${port}`);
  fs.appendFile( serverLogPath , `Server is listening on ${port}\n`, (err) => {
    if(err) {
      console.log('Unable to append to server.log');
    }
  });
});
