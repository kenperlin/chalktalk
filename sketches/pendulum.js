function() {
   this.label = "pendulum";
   this.spring = new Spring();
   this.force = 0;
   this.adjustHeight = 1;
   this.angle = 0;

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

      switch (this.swingMode) {
      case 'swing':
         this.force = 10 * dx / height();
         break;
      case 'height':
         this.adjustHeight *= 1 + dy / height() / this.rodHeight;
         break;
      }
      this.xx = x;
      this.yy = y;
   }

   this.render = function(elapsed) {
      var hubWidth  = this.stretch('hub width' , 10 * S(0).width);
      var rodHeight = this.stretch('rod length', 10 * (S(2).y - S(1).ylo) / 4) * 4;
      var bobRadius = this.stretch('bob size'  , 10 * (S(2).width + S(2).height) / 4);

      this.rodHeight = rodHeight * this.adjustHeight;

      this.spring.setMass(this.rodHeight * bobRadius);
      this.spring.setForce(this.force);
      this.force *= 0.9;
      this.spring.update(elapsed);

      var N = 32;
      m.scale(.5 * this.size / 40);
      m.translate(0, 2 - this.rodHeight, 0);
      mCurve([[-.5 * hubWidth, this.rodHeight], [.5 * hubWidth, this.rodHeight]]);

      this.angle = def(this.inValues[0], this.spring.getPosition());
      if (isNaN(this.angle)) this.angle = 0;

      m.translate(0, this.rodHeight, 0);
      m.rotateZ(this.angle);
      m.translate(0, -this.rodHeight, 0);

      mCurve([[0, this.rodHeight], [0,bobRadius]]);
      mDrawOval([-bobRadius, -bobRadius], [bobRadius, bobRadius], N, PI/2, PI/2-TAU);
   }

   this.output = function() { return this.angle; }
}

