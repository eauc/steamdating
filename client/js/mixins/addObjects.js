_.mixin({
  addObjects: function(base, other, addValueFnc) {
    return _.reduce(other, function(mem, value, key) {
      if(_.exists(mem[key])) mem[key] = addValueFnc(mem[key], value);
      else mem[key] = value;
      return mem;
    }, _.snapshot(base));
  }
});
