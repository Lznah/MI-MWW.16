const _ = require("lodash");

var hamilton = (a, b) => {
  var sum = 0;
  _.forEach(a,(element, index) => {
    sum += Math.abs(element-b[index])/a.length;
  });
  return Math.round(1000*(1-sum))/1000;
}

module.exports = {hamilton};
