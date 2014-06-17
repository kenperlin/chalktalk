/*
    Examples for June 26, 2014 talk.

    cup() shows a coffee cup and swirling cream that illustrates the onset of turbulence.

    Noises/noise1D allows copies 1D noise to be successively frequency doubled.
    Then they can all be dragged together to show the fractal sum of 1/f noise.
*/

   registerGlyph("cup()", [

      // TEMPLATE TO MATCH FOR THE FREEHAND SKETCH OF THE COFFEE CUP.

      [ [ -1,-1 ], [ -1,1 ], [ 1,1 ], [1,-1 ] ],    // SIDES AND BOTTOM.
      [ [ 1,-1], [-1,-1], [1,-1] ],                 // TOP.
      makeOval(-1.6,-.6, 1.2, 1.2, 20, 0, PI),      // OUTER HANDLE.
      makeOval(-1.4,-.4, 0.8, 0.8, 20, 0, PI),      // INNER HANDLE.
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

      sketch.mouseDown = function(x, y) {
         this.mx = x;
         this.my = y;
      }
      sketch.mouseDrag = function(x, y) {
      }
      sketch.mouseUp = function(x, y) {
         if (len(x - this.mx, y - this.my) > 2 * clickSize) {
            this.swirlMode = pieMenuIndex(x - this.mx, y - this.my, 4);
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

   function Noises() {
      this.labels = "noise1D".split(' ');

      this.freqs = [1];
      this.isAbs = false;
      this.mode = "none";
      this.mouseX = 0;
      this.mouseY = 0;
      this.t0 = 0;

      this.hitOnUp = function(sketch) {
         if (sketch instanceof Noises) {
            this.freqs = this.freqs.concat(sketch.freqs);
            deleteSketch(sketch);
         }
      }

      this.mouseDown = function(x, y) {
         this.mouseX = x;
         this.mouseY = y;
         this.isClick = true;
      }

      this.mouseDrag = function(x, y) {
         if (! this.isClick) {
            if (this.mode == "none")
               this.mode = abs(x - this.mouseX) > abs(y - this.mouseY) ? "x" : "y";
            if (this.mode == "x") {
               this.t0 -= 2 * (x - this.mouseX) / (this.xhi - this.xlo);
               this.mouseX = x;
               this.mouseY = y;
            }
         }
      }

      this.mouseUp = function(x, y) {
         if (! this.isClick && this.mode == "y") {
            var factor = y < this.mouseY ? 2 : 0.5;
            for (var n = 0 ; n < this.freqs.length ; n++)
               this.freqs[n] *= factor;
         }
         if (this.isClick) {
            this.isAbs = ! this.isAbs;
         }
         this.mode = "none";
      }

      this.render = function(elapsed) {
         m.save();
            m.scale(this.size / 350);

            color(140,140,140);
            mLine([-1,0],[1,0]);
            color(this.color);

            var maxFreq = 1;
            for (var n = 0 ; n < this.freqs.length ; n++)
               maxFreq = max(maxFreq, this.freqs[n]);
            var stepSize = 0.1 / maxFreq;

            var c = [];
            for (var t = -1 ; t < 1 + stepSize ; t += stepSize) {
               if (t > 1)
                  t = 1;
               var signal = 0;
               for (var n = 0 ; n < this.freqs.length ; n++) {
                  var freq = this.freqs[n];
                  var f = noise2((this.t0 + t) * freq, 200 * freq) / freq;
                  signal += this.isAbs ? abs(f) : f;
               }
               c.push([t, signal]);
            }
            mCurve(c);

         m.restore();
      }
   }
   Noises.prototype = new Sketch;

/*
   Things to work on:
           DONE Coffee cup:
                profile view morphs into
                3/4 view morphs into
                top view.
                Pour line of cream.
                Swirling cream folds over.
                Swirls more then folds over a second time.
                Mention Feigenbaum,onset of turbulence and powers of two.
        Marble principle
                show stripes (show code for this)
                add phase shift (show code for this)
                use turbulence instead of fractal sum.
        Add gesture to set to a particular page (with its attendant sketch definitions).
        Flame -> corona
        Clouds
        Smoke
        Principle of endless cycle for noise.
        List of movies.
        nVideo, etc., -> WebGL
        Animated creature:  Add noise to movement.
        Trees waving in the wind.
                - build as a fractal.
                - add noise to each node (show code).
        Slice through a 3D block.
        To make a marble vase:
                - draw a contour.
                - draw a circle.
                - drag circle to contour to create 3D shape.
                - add texture (show code).
*/

var planetFragmentShader = ["\
   void main(void) {\
      float z = sqrt(1.-x*x-y*y);\
      float cRot = cos(.2*time), sRot = sin(.2*time);\
      float cVar = cos(.1*time), sVar = sin(.1*time);\
      vec3 pt = vec3(cRot*x+sRot*z+cVar, y, -sRot*x+cRot*z+sVar);\
      float g = turbulence(pt);                      /* CLOUDS */\
      vec2 v = .6 * vec2(x,y);                       /* SHAPE  */\
      float d = 1. - 4.1 * dot(v,v);\
      float s = .3*x + .3*y + .9*z; s *= s; s *= s;  /* LIGHT  */\
      d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : d>-.1 ? d+.1 : 0.;\
      float f = -.2 + sin(4. * pt.x + 8. * g + 4.);  /* FIRE   */\
      f = f > 0. ? 1. : 1. - f * f * f;\
      if (d <= 0.1)\
         f *= (g + 5.) / 3.;\
      vec3 color = vec3(d*f*f*.85, d*f, d*.7);       /* COLOR  */\
      if (d <= .05) {                                /* STARS  */\
         float t = noise(vec3(80.*x-time, 80.*y+.3*time, 1));\
         if ((t = t*t*t*t) > color.x)\
           color = vec3(t,t,t);\
      }\
      gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

registerGlyph("planet()",[
   makeOval(-1, -1, 2, 2, 32),                // OUTLINE PLANET CCW FROM TOP.
   [ [0,-1], [-1/2,-1/3], [1/2,1/3], [0,1] ], // ZIGZAG DOWN CENTER, FIRST LEFT THEN RIGHT.
]);

function planet() { addShaderPlaneSketch(defaultVertexShader, planetFragmentShader); }

var marbleFragmentShader = ["\
   void main(void) {\
      float t = mode == 0. ? 0. :\
                mode == 1. ? .7 * noise(vec3(x,y,0.)) :\
		mode == 2. ? .5 * fractal(vec3(x,y,5.)) :\
		             .4 * (turbulence(vec3(x*1.5,y*1.5,10.))+1.8) ;\
      float s = pow(.5+.5*cos(7.*x+6.*t),.1);\
      vec3 color = vec3(s,s*s,s*s*s);\
      gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

registerGlyph("marble()",[
   [ [-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ],    // SQUARE OUTLINE CW FROM TOP LEFT.
   [ [-1/3,-1], [-1/3,1] ],
   [ [ 1/3,-1], [ 1/3,1] ],
]);

function marble() {
   var sketch = addShaderPlaneSketch(defaultVertexShader, marbleFragmentShader);
   sketch.code = [
      ["stripes", "sin(x)"],
      ["add noise", "sin(x + noise(x,y,z))"],
      ["add fractal", "sin(x + fractal(x,y,z))"],
      ["add turbulence", "sin(x + turbulence(x,y,z))"],
   ];
}

function Grid() {
   this.labels = "empty".split(' ');
   this.gridMode = -1;
   this.is3D = true;
   this.mouseDown = function(x, y) {
      this.mx = x;
      this.my = y;
   }
   this.mouseDrag = function(x, y) {
   }
   this.mouseUp = function(x, y) {
      if (len(x - this.mx, y - this.my) > 2 * clickSize)
         this.gridMode = pieMenuIndex(x - this.mx, y - this.my, 4);
   }
   this.render = function(elapsed) {
      var f = 2/3;
      m.save();
         m.scale(this.size / 400);
         mCurve([[-1,0], [1, 0]]);
         mCurve([[ 0,1], [0, -1]]);
	 this.afterSketch(function(S) {
            mCurve([[-1, f], [1, f]]);
            mCurve([[-1,-f], [1,-f]]);
            mCurve([[-f,1], [-f,-1]]);
            mCurve([[ f,1], [ f,-1]]);
	    switch (S.gridMode) {
            case 2:
	       var d = 1/20;
	       color('yellow');
	       lineWidth(0.5);
	       for (var u = -1 ; u <= 1 ; u += d)
	       for (var v = -1 ; v <= 1 ; v += d) {
	          var t0 = noise2(u, v);
	          var tu = noise2(u+d, v);
	          var tv = noise2(u, v+d);
		  if (u < 1)
	             mCurve([[u*f,v*f,t0] , [(u+d)*f,v*f,tu]]);
		  if (v < 1)
	             mCurve([[u*f,v*f,t0] , [u*f,(v+d)*f,tv]]);
               }
	    case 1:
	       lineWidth(1);
	       color('rgb(64,255,64)');
	       for (var u = -1 ; u <= 1 ; u += 1)
	       for (var v = -1 ; v <= 1 ; v += 1) {
	          var t0 = noise2(u, v    );
	          var t1 = noise2(u, v+.01);
		  var s = .1 * (t1 - t0) / .01;
	          mCurve([[u*f,v*f-.1,-s] , [u*f,v*f+.1,s]]);
               }
	    case 0:
	       lineWidth(1);
	       color('red');
	       for (var u = -1 ; u <= 1 ; u += 1)
	       for (var v = -1 ; v <= 1 ; v += 1) {
	          var t0 = noise2(u    , v);
	          var t1 = noise2(u+.01, v);
		  var s = .1 * (t1 - t0) / .01;
	          mCurve([[u*f-.1,v*f,-s] , [u*f+.1,v*f,s]]);
               }
	       break;
	    }
	 });
      m.restore();
   }
}
Grid.prototype = new Sketch;

