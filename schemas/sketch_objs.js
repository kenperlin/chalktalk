  var mongoose = require('mongoose');

  module.exports = mongoose.model('SketchData',{
  	name : String,
  	strokes : Array
  });
  //creating the schema for sketches
  // var sketch_schema = new mongoose.Schema({sketch: Object});
  // SavedSketch = mongoose.model('SavedSketch', sketch_schema);
