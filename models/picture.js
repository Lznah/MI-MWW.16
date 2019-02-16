const mongoose = require('mongoose');
const _ = require('lodash');

var PictureSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  rgb_histograms: {
    red: {
      type: Array,
      required: true
    },
    green: {
      type: Array,
      required: true
    },
    blue: {
      type: Array,
      required: true
    }
  },
  single_bin: {
    type: Array,
    required: true
  }
});

var Picture = mongoose.model('Picture', PictureSchema);

module.exports = {Picture}
