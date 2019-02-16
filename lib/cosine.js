const _ = require("lodash");

var cosine = (a, b) => {
  var sum = 0;
  var numerator = 0;
  _.forEach(a, (element, index) => {
    numerator += element*b[index];
  });
  var denominator1 = 0;
  _.forEach(a, (element) => {
    denominator1 += element*element;
  });
  denominator1 = Math.sqrt(denominator1);
  var denominator2 = 0;
  _.forEach(b, (element) => {
    denominator2 += element*element;
  });
  denominator2 = Math.sqrt(denominator2);
  return Math.round(1000*numerator/(denominator1*denominator2))/1000;
}

module.exports = {cosine};
