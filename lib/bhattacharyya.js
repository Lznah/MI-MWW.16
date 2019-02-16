const _ = require("lodash");

var bhattacharyya = (a, b) => {
  var sum = 0;
  _.forEach(a,(element, index) => {
    sum += Math.sqrt(element*b[index]);
  });
  return Math.round(1000*sum/3)/1000;
}

module.exports = {bhattacharyya};
