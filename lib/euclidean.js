const _ = require("lodash");

var euclidean = (a, b) => {
  var sum = 0;
  _.forEach(a,(element, index) => {
    sum += ((element-b[index])**2)/a.length;
  });
  sum = Math.sqrt(sum);
  return Math.round(1000*(1-sum))/1000;
}

module.exports = {euclidean};
