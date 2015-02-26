_.mixin({
  addHeaderLists: function(base, other, addValueFnc) {
    return _.reduce(other, function(mem, other_entry) {
      var mem_faction_entry = _.find(mem, function(mem_entry) {
        return mem_entry[0] === other_entry[0];
      });
      if(!_.exists(mem_faction_entry)) {
        mem.push(_.snapshot(other_entry));
        return mem;
      }
      mem_faction_entry[1] = addValueFnc(mem_faction_entry[1],
                                         other_entry[1]);
      return mem;
    }, _.snapshot(base));
  }
});
