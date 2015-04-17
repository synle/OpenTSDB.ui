'use strict';

var self = module.exports = {};
self._errors = [];
self.log = function() {
    console.log(arguments)
}
self.error = function() {
    console.error(arguments);
    self._errors.push(arguments);
}