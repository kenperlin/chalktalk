var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test');

module.exports = mongoose.connection;