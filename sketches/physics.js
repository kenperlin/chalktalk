
function Physics() {
   this.labels = "swing".split(' ');

   this.computeStatistics = function() {
      var b = traceComputeBounds(this.glyphTrace);
      this.hubWidth = 10 * (b[0][2] - b[0][0]) / this.size;
      this.radius = 5 * (b[2][2] - b[2][0] + b[2][3] - b[2][1]) / 2 / this.size;
      this.ht = 8.5 * ((b[2][1]+b[2][3])/2 - b[1][1]) / this.size;
   }

   this.hubWidth = 1;
   this.spring = new Spring();
   this.ht0 = 4.0;
   this.ht = this.ht0;
   this.radius = 1;
   this.force = 0;

   this.mouseDown = function(x, y) {
      this.xx = x;
      this.yy = y;
      this.swingMode = 'none';
   }

   this.mouseDrag = function(x, y) {
      var dx = x - this.xx;
      var dy = y - this.yy;
      if (this.swingMode == 'none')
         if (dx * dx + dy * dy > 10 * 10)
            this.swingMode = dx * dx > dy * dy ? 'swing' : 'height';
         else
            return;

      var sc = this.ht / height() / (this.scale()/4);
      switch (this.swingMode) {
      case 'swing':
         this.force = sc * dx;
         break;
      case 'height':
         this.ht += sc * dy;
         break;
      }
      this.xx = x;
      this.yy = y;
   }

   this.render = function(elapsed) {
      var sc = this.size / 400;

      this.afterSketch(function() {
         if (this.portLocation.length == 0) {
            this.addPort("H", -.25 * sc * this.hubWidth, sc);
            this.addPort("S",  .25 * sc * this.hubWidth, sc);
         }
      });

      if (this.isInValue("H"))
         this.ht = this.getInFloat("H");

      this.spring.setMass(this.ht / this.ht0);
      this.spring.setForce(this.force);
      this.force *= 0.9;
      this.spring.update(elapsed);

      var N = 32;
      m.save();
      m.scale(.5 * this.size / 400);
      m.translate(0, 2-this.ht, 0);
      this.anchor = m.transform([0,this.ht,0]);
      mCurve([[-.5*this.hubWidth,this.ht], [.5*this.hubWidth,this.ht]]);

      var angle = this.isInValue("S") ? this.getInFloat("S")
                                      : this.spring.getPosition();
      if (isNaN(angle)) angle = 0;

      this.setOutValue("S", "" + angle);

      m.translate(0,this.ht,0);
      m.rotateZ(angle);
      m.translate(0,-this.ht,0);

      mCurve([[0,this.ht], [0,this.radius]]);
      var c = [];
      for (var i = 0 ; i <= N ; i++) {
         var a = TAU * i / N;
         c.push([this.radius * sin(a), this.radius * cos(a)]);
      }
      mCurve(c);

      m.restore();
   }
}
Physics.prototype = new Sketch;
