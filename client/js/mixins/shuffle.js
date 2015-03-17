R.shuffle = (function() {
  function random(min, max) {
    if(R.isNil(max)) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }
  return function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    R.forEach(function(value) {
      rand = random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    }, obj);
    return shuffled;
  };
})();
