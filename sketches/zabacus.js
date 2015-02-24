function() {
   this.label = "abacus";

   this.digits = [0,0,0];
   this.digitsIndex = 0;
   this.stones = null;

   this.mouseDown = function(x, y) {
      var xx = (x - this.xlo + x - this.xhi) / (this.xhi - this.xlo);
      var yy = (y - this.ylo + y - this.yhi) / (this.yhi - this.ylo);
      this.digitsIndex = xx < -.4 ? 0 : xx < .4 ? 1 : 2;
      this.xx = xx;
      this.yy = yy;
   }
   this.mouseDrag = function(x, y) {
      var xx = (x - this.xlo + x - this.xhi) / (this.xhi - this.xlo);
      var yy = (y - this.ylo + y - this.yhi) / (this.yhi - this.ylo);
      var index = this.digitsIndex;
      var value = this.digits[index] - (yy - this.yy) / 20;
      this.digits[index] = max(0, min(9.99, value));
   }
   this.mouseUp = function(x, y) {
      var xx = (x - this.xlo + x - this.xhi) / (this.xhi - this.xlo);
      var yy = (y - this.ylo + y - this.yhi) / (this.yhi - this.ylo);
      if (abs(xx - this.xx) > abs(yy - this.yy))
         this.animateAbacus = this.animateAbacus === undefined ? true : undefined;
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve( [[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]] );
         mCurve( [[ -1,.5],[  1,.5]] );
         mCurve( [[-.6, 1],[-.6,-1]] );
         mCurve( [[  0, 1],[  0,-1]] );
         mCurve( [[ .6, 1],[ .6,-1]] );
      });

      this.afterSketch(function() {

         if (this.animateAbacus !== undefined)
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

         if (isCodeWidget && this == codeSketch) {
            this.oldDigits = this.newDigits;
            this.newDigits = floor(this.digits[0]) + "" +
                               floor(this.digits[1]) + "" +
                               floor(this.digits[2]) ;
            if (this.newDigits != this.oldDigits) {
               this.code = [["", this.newDigits]];
               toggleCodeWidget();
               toggleCodeWidget();
            }
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
/*
      abacus.setMaterial(new phongMaterial().setAmbient(.2,.1,.05)
                                            .setDiffuse(.2,.1,.05)
                                            .setSpecular(.2,.2,.2,20));
*/
      return abacus;
   }
}
