function() {
   this.label = "pendulum";
   this.spring = new Spring();
   this.force = 0;
   this.stretch = 1;

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
         this.force = 20 * dx / height();
         break;
      case 'height':
         this.stretch += 4 * dy / height();
         break;
      }
      this.xx = x;
      this.yy = y;
   }

   this.render = function(elapsed) {
      var hubWidth  = variable(1, S(0).width);
      var rodHeight = variable(4, S(2).y - S(1).ylo);
      var bobRadius = variable(1, (S(2).width + S(2).height) / 4);

      this.rodHeight = rodHeight * this.stretch;

      this.spring.setMass(this.rodHeight);
      this.spring.setForce(this.force);
      this.force *= 0.9;
      this.spring.update(elapsed);

      var N = 32;
      m.scale(.5 * this.size / 40);
      m.translate(0, 2 - this.rodHeight, 0);
      this.anchor = m.transform([0, this.rodHeight, 0]);
      mCurve([[-.5 * hubWidth, this.rodHeight], [.5 * hubWidth, this.rodHeight]]);

      var angle = /* this.isInValue("S") ? this.getInFloat("S")
                                         : */ this.spring.getPosition();
      if (isNaN(angle)) angle = 0;

      m.translate(0, this.rodHeight, 0);
      m.rotateZ(angle);
      m.translate(0, -this.rodHeight, 0);

      mCurve([[0, this.rodHeight], [0,bobRadius]]);
      mDrawOval([-bobRadius, -bobRadius], [bobRadius, bobRadius], N, PI/2, PI/2-TAU);

      this.setOutPortValue(angle);
   }

}
