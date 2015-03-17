R.addHeaderLists = (function() {
  return R.curry(function(addValueFnc, base, other) {
    return R.reduce(function(mem, other_entry) {
      var mem_faction_entry = R.find(function(mem_entry) {
        return mem_entry[0] === other_entry[0];
      }, mem);
      if(R.isNil(mem_faction_entry)) {
        return R.append(R.clone(other_entry), mem);
      }
      mem_faction_entry[1] = addValueFnc(mem_faction_entry[1],
                                         other_entry[1]);
      return mem;
    }, R.clone(base), other);
  });
})();
