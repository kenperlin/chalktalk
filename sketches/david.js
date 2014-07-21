
function David() {
   this.labels = "david1".split(' ');
   this.render = function(elapsed) {
      var sc = this.size / 400;
      m.save();
	 m.scale(sc);
	 mCurve([[-1,-1],[0, 1],[1,-1]]);
	 mCurve([[-1, 1],[0,-1],[1, 1]]);
      m.restore();
   }
}
David.prototype = new Sketch;
