const _ = require("lodash");

var intersection = (a, b) => {
  var sum = 0;
  var sumA = 0;
  var sumB = 0;
  _.forEach(a,(element, index) => {
    sumA += element;
    sumB += b[index];
    sum += Math.min(element, b[index]);
  });
  sum = sum / Math.max(sumA, sumB);
  return Math.round(1000*(sum))/1000;
}

module.exports = {intersection};
