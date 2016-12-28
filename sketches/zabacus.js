function() {
   this.label = "abacus";

   this.digits = [0,0,0];
   this.digitsIndex = 0;
   this.stones = null;
   this.animateValue = false;

   this.onSwipe[0] = ['start', function() { this.animateValue = true ; }];
   this.onSwipe[2] = ['incr', function() { this.incr(this.digitAtCursor(), 1); }];
   this.onSwipe[4] = ['stop' , function() { this.animateValue = false; }];
   this.onSwipe[6] = ['incr', function() { this.incr(this.digitAtCursor(), -1); }];

   this.incr = function(n, d) {
      this.digits[n] += d;
      if (this.digits[n] < 0) {
         if (n == this.digits.length - 1)
            this.digits[n] = 0;
         else if (n > 0) {
            this.digits[n] = 9;
            this.incr(n - 1, -1);
	 }
	 else
            this.digits[n] = 0;
      }
      else if (this.digits[n] == 10) {
         if (n == 0)
	    this.digits[n] = 9;
         else {
            this.digits[n] = 0;
            this.incr(n - 1, 1);
         }
      }
   }

   this.digitAtCursor = function() {
      return this._cursorPoint.x < -.29 ? 0 :
             this._cursorPoint.x <  .29 ? 1 : 2;
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve( [[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]] );
         mCurve( [[-1,.5],[1,.5]] );
      });

      this.afterSketch(function() {

         if (isDef(this.inValue[0])) {
	    var n = max(0, min(999, floor(this.inValue[0])));
	    this.digits[0] = floor(n / 100);
	    this.digits[1] = floor((n % 100) / 10);
	    this.digits[2] = floor(n % 10);
	 }

         if (this.animateValue)
            this.digits[2] += 16 * elapsed;

         for (var index = 2 ; index >= 0 ; index--)
            if (this.digits[index] >= 10) {
               this.digits[index] -= 10;
               if (index > 0)
                  this.digits[index-1]++;
            }
            else if (this.digits[index] < 0) {
               this.digits[index] += 10;
               if (this.digits[index] > 0)
                  this.digits[index-1]--;
            }

         if (this.mesh !== undefined)
            for (var i = 0 ; i < this.stones.children.length ; i++) {
               var n = i % 5;
               var d = this.digits[floor(i/5)];
               this.stones.children[i].getMatrix().identity();
               if (n==0 ? d % 5 >= 4 :
                   n==1 ? d % 5 >= 3 :
                   n==2 ? d % 5 >= 2 :
                   n==3 ? d % 5 >= 1 : d >= 5)
                  this.stones.children[i].getMatrix().translate(0, .1, 0);
            }
      });
   }

   this.output = function() {
      return 100 * floor(this.digits[0]) +
	      10 * floor(this.digits[1]) +
	           floor(this.digits[2]) ;
   }

   this.createMesh = function() {
      var abacus = new THREE.Mesh();

      abacus.addCylinder(16).getMatrix().translate( 0,  1,0).rotateZ(PI/2).scale(.05,1 ,.1);
      abacus.addCylinder(16).getMatrix().translate( 0,.45,0).rotateZ(PI/2).scale(.10,1 ,.1);
      abacus.addCylinder(16).getMatrix().translate( 0, -1,0).rotateZ(PI/2).scale(.05,1 ,.1);
      abacus.addCylinder(16).getMatrix().translate(-1, 0,0)               .scale(.05,1 ,.1);
      abacus.addCylinder(16).getMatrix().translate( 1, 0,0)               .scale(.05,1 ,.1);

      abacus.addGlobe(16, 8).getMatrix().translate(-1, 1,0)               .scale(.05,.05,.1);
      abacus.addGlobe(16, 8).getMatrix().translate( 1, 1,0)               .scale(.05,.05,.1);
      abacus.addGlobe(16, 8).getMatrix().translate(-1,-1,0)               .scale(.05,.05,.1);
      abacus.addGlobe(16, 8).getMatrix().translate( 1,-1,0)               .scale(.05,.05,.1);

      abacus.addCylinder(16).getMatrix().translate(-.6,0,0).scale(.03,1,.03);
      abacus.addCylinder(16).getMatrix().translate(  0,0,0).scale(.03,1,.03);
      abacus.addCylinder(16).getMatrix().translate( .6,0,0).scale(.03,1,.03);

      this.stones = abacus.addNode();
      for (var i = 0 ; i < 3 ; i++) {
         var x = -.6 + .6 * i;
         for (var j = 0 ; j < 6 ; j++)
            if (j != 4) {
               var y = (j == 5 ? 1.5 : j * .3) - .8;
               this.stones.addNode().addGlobe(24,12).getMatrix().translate(x,y,0).scale(.2,.155,.2);
            }
      }

      abacus.setMaterial(this.shaderMaterial());

      return abacus;
   }
}
