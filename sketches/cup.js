registerGlyph("cup()", [

   // TEMPLATE TO MATCH FOR THE FREEHAND SKETCH OF THE COFFEE CUP.

   [ [ -1,-1 ], [ -1,1 ], [ 1,1 ], [1,-1 ] ],    // SIDES AND BOTTOM.
   [ [ 1,-1], [-1,-1], [1,-1] ],                 // TOP.
   makeOval(-1.6,-.6, 1.2, 1.2, 20, PI/2, 3*PI/2),      // OUTER HANDLE.
   makeOval(-1.4,-.4, 0.8, 0.8, 20, PI/2, 3*PI/2),      // INNER HANDLE.
]);

function cup() {
   var node = root.addNode();

   // THE BODY OF THE CUP IS A HOLLOW TAPERED CYLINDER.

   var body = node.addLathe( [
      [ 0.00, 0, -1.00],
      [ 0.90, 0, -1.00],
      [ 1.00, 0, -0.90],
      [ 1.00, 0,  1.00],
      [ 0.90, 0,  1.00],
      [ 0.90, 0, -0.90],
      [ 0.00, 0, -0.90],
   ], 32);

   // THE HANDLE STICKS INTO THE CUP. WE DON'T CARE SINCE THAT PART IS COVERED BY THE COFFEE.

   var handle = node.addTorus(.3, 8, 24);
   handle.getMatrix().translate(-1,0,0).rotateX(PI/2).scale(.5);

   var coffee = node.addCylinder();
   coffee.getMatrix().translate(0,0,.9).scale(.95,.95,.01);

   node.setMaterial(whiteMaterial);
   coffee.setMaterial(new phongMaterial().setAmbient(.07,0,0));

   var sketch = geometrySketch(node, [0.1,0,0,-PI/2,0.9]);
   sketch.swirlMode = -1;

   sketch.coffee = coffee;

   sketch.mouseDrag = function() { }
   sketch.onSwipe = function(dx, dy) {
      this.swirlMode = pieMenuIndex(dx, dy);
      this.swirlStartTime = time;
      switch (this.swirlMode) {
      case 0:
         this.cream = [];
         for (var i = 0 ; i < 100 ; i++) {
            var t = i / 100;
            this.cream.push( [ lerp(t, -1, 1) , 0 ] );
         }
         break;
      }
   }

   sketch.update = function(elapsed) {

      if (this.swirlMode == 0) {
         var x0 = (this.xlo + this.xhi) / 2;
         var y0 = (this.ylo + this.yhi) / 2;
         var r  = (this.xhi - this.xlo) / 2;

         var dt = .25 * (time - this.swirlStartTime);
         if (dt > 5)
            dt = 5 + .1 * (dt - 5);

         var fade = 1 - sCurve(max(0, 1 - dt / 5.5));

         var freq = pow(2, dt/1.5);
         var eps = .01;

         for (var i = 0 ; i < this.cream.length ; i++) {
            var cx = this.cream[i][0];
            var cy = this.cream[i][1];

            var n00 = .2 * noise2(freq * cx      , freq * cy       + 180);
            var n10 = .2 * noise2(freq * cx + eps, freq * cy       + 180);
            var n01 = .2 * noise2(freq * cx      , freq * cy + eps + 180);

            var dx = (n01 - n00) / eps;
            var dy = (n00 - n10) / eps;

            cx += elapsed * dx;
            cy += elapsed * dy;

            var rr = cx * cx + cy * cy;
            var f = lerp(1 - rr, .995, 1);
            cx *= f;
            cy *= f;

            this.cream[i][0] = cx;
            this.cream[i][1] = cy;
         }

         function fillIn(a, eps) {
            for (var i = 0 ; i < a.length - 1 ; i++) {

               var x0 = a[i  ][0];
               var y0 = a[i  ][1];

               var x1 = a[i+1][0];
               var y1 = a[i+1][1];

               if (len(x1 - x0, y1 - y0) > 0.1) {
                  var midpoint = [ (x0 + x1) / 2, (y0 + y1) / 2 ];

                  var A = a.slice(0, i+1);
                  var B = [ midpoint ];
                  var C = a.slice(i+1, a.length);

                  a = A.concat(B);
                  a = a.concat(C);

                  i++;
               }
            }
            return a;
         }

         if (dt < 4.5)
            this.cream = fillIn(this.cream, 0.1);

         _g.save();
         _g.lineWidth = (this.xhi - this.xlo) * lerp(fade * fade, .0025, .005);
         _g.strokeStyle = 'rgba(255,255,255,' + (1-fade) + ')';
         _g.beginPath();

         var scale = lerp(dt/5, .55, .75), xPrev = 0, yPrev = 0;
         for (var i = 0 ; i < this.cream.length ; i++) {
            var x = x0 + r * this.cream[i][0] * scale;
            var y = y0 + r * this.cream[i][1] * scale;
            if (i == 0 /* || len(x-xPrev,y-yPrev) > 20 */)
               _g.moveTo(x, y);
            else if (i/this.cream.length < dt)
               _g.lineTo(x, y);
            xPrev = x;
            yPrev = y;
         }

         sketch.coffee.setMaterial(new phongMaterial().setAmbient(lerp(fade*fade,.07,.16),0,0));

         _g.stroke();
         _g.restore();
      }
   }
}
