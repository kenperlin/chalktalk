
   function Ray1() {
      this.labels = "ray1".split(' ');
      this.is3D = true;
      this.rayX = 0;
      this.rayY = 0;
      this.mouseDrag = function(x, y) {
         this.rayX = 1 - 2 * (x-this.xlo) / (this.xhi - this.xlo);
         this.rayY = 2 * (y-this.yhi) / (this.ylo - this.yhi) - 1;
      }
      this.render = function(elapsed) {
         m.save();
         m.rotateY(2);

         var a = [-1,.75], b = [1,.75], c = [1,-.75], d = [-1,-.75];
         mLine(a, b);
         mLine(b, c);
         mLine(c, d);
         mLine(d, a);
         mLine([0,0,-2],[this.rayX,this.rayY,2]);

         this.afterSketch(function() {
            mArrow([0,0,-2],[this.rayX,this.rayY,2],.3);
            lineWidth(0.5);
            mLine([this.rayX/2,.75],[this.rayX/2,-.75]);
            mLine([1,this.rayY/2],[-1,this.rayY/2]);
            mText("V", [0,.1,-2]);
            mText("W", [this.rayX/4,this.rayY/4 + .1,-1]);
         });

         m.restore();
      }
   }
   Ray1.prototype = new Sketch;

   function Vec4() {
      this.labels = "vec4".split(' ');
      this.render = function(elapsed) {
         m.save();
         var x = .25;
         mCurve([[-x,1],[x,1],[x,-1],[-x,-1],[-x,1]]);
         lineWidth(1);
         mLine([-x, .5],[x, .5]);
         mLine([-x, .0],[x, .0]);
         mLine([-x,-.5],[x,-.5]);
         this.afterSketch(function() {
            for (var j = 0 ; j < 4 ; j++) {
               var y = (1.5 - j) / 2;
               var id = "" + j;
               if (this.portLocation.length < 4) {
                  this.addPort(id, 0, y);
                  this.setDefaultValue(id, j==0 ? 1 : 0);
               }
               var textHeight = _g.textHeight;
               _g.textHeight = textHeight * (this.yhi - this.ylo) / 150;
               this.drawValue(this.getDefaultValue(id), m.transform([0,y]), .5, .5);
               _g.textHeight = textHeight;
            }
         });
         m.restore();
      }
   }
   Vec4.prototype = new Sketch;

   function Mat4() {
      this.labels = "mat4".split(' ');
      this.mode = 0;
      this.onClick = function(x, y) {
         this.mode++;
      }
      this.render = function(elapsed) {
         m.save();
         mCurve([[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]]);
         mLine([-.5,1],[-.5,-1]);
         mLine([  0,1],[  0,-1]);
         mLine([ .5,1],[ .5,-1]);
         mLine([-1, .5],[1, .5]);
         mLine([-1,  0],[1,  0]);
         mLine([-1,-.5],[1,-.5]);
         this.afterSketch(function() {
            if (this.mode > 0) {
               var vals = (this.mode % 2) == 1 ? [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
                                               : [0,1,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,1] ;
               textHeight((this.xhi - this.xlo) / 10);
               for (var i = 0 ; i < 4 ; i++)
               for (var j = 0 ; j < 4 ; j++) {
                  var x = (i - 1.5) / 2;
                  var y = (1.5 - j) / 2;
                  mText(vals[i + 4 * j], [x, y], .5, .5);
               }
            }
         });
         m.restore();
      }
   }
   Mat4.prototype = new Sketch;

   function Cyl1() {
      this.labels = "cyl1".split(' ');
      this.is3D = true;
      this.nSteps = 8;
      this.mouseDrag = function(x, y) {
         if (this.y0 === undefined)
            this.y0 = y;
         var i0 = floor(this.y0 / 20);
         var i1 = floor(     y  / 20);
         if (i1 != i0) {
            this.nSteps = max(4, this.nSteps + (i1 < i0 ? 1 : -1));
            this.y0 = y;
         }
      }
      this.mouseUp = function(x, y) {
         delete this.y0;
      }
      this.render = function(elapsed) {
         m.save();
         this.duringSketch(function() {
            mCurve([[1,-1],[-1,-1],[-1,1],[1,1],[1,-1]]);
         });
         this.afterSketch(function() {
            var C0 = [], C1 = [], C2 = [], C3 = [], C4 = [];
            for (var theta = 0 ; theta <= TAU + .0001 ; theta += TAU / this.nSteps) {
               var c = cos(theta);
               var s = sin(theta);
               C0.push([s, 1,c]);
               C1.push([s,-1,c]);
               C2.push([0, 1,0]);
               C2.push([s, 1,c]);
               C3.push([0,-1,0]);
               C3.push([s,-1,c]);
               C4.push([s, 1,c]);
               if (theta < TAU)
                  C4.push([s,-1,c]);
            }
            mCurve(C0);
            mCurve(C1);
            lineWidth(.5);
            mCurve(C2);
            mCurve(C3);
            mCurve(C4);
         });
         m.restore();
      }
    }
   Cyl1.prototype = new Sketch;

   function F1D() {
      this.code = [["", "t*t/2 - 1/8"]];
      this.labels = "f1d".split(' ');

      this.f = function(t) {
         var result = this._f(t);
         return result == null ? 0 : result;
      }
      this._f = function(t) {
         var result = null;
         try {
            eval("result = (" + this.code[0][1] + ")");
         } catch (e) { return 0; }
         return result;
      }
      this.render = function(elapsed) {
         if (this.nPorts == 0) {
            this.addPort("t", -1, 0);
            this.addPort("f",  1, 0);
         }
         m.save();

         lineWidth(1);
         mCurve([[-1,0],[1,0]]);
         mCurve([[0,-1],[0,1]]);

         var e = 1/30;
         var C = [];
         for (var t = -1 ; t <= 1 ; t += e)
            C.push([t, this.f(t)]);
         lineWidth(2);
         mCurve(C);

         this.afterSketch(function() {
            var t = this.isInValue("t") ? this.getInFloat("t") : 0;
            var y = this._f(t);
            if (y != null) {
               this.setOutValue("f", y);
               color(scrimColor(0.5));
               var tt = max(-1, min(1, t));
               var yy = max(-1, min(1, y));
               mFillCurve([ [0,0], [tt,0], [tt,yy], [0,yy] ]);
            }
         });

         m.restore();
      }
   }
   F1D.prototype = new Sketch;

   function F2D() {
      this.code = [["function", "(x*x + y*y)/2 - 1/8"]];
      this.labels = "f2d".split(' ');
      this.is3D = true;
      this.f = function(x,y) {
         var result = this._f(x,y);
         return result == null ? 0 : result;
      }
      this._f = function(x,y) {
         var result = null;
         try {
            eval("result = (" + this.code[0][1] + ")");
         } catch (e) { return 0; }
         return result;
      }
      this.render = function(elapsed) {
         if (this.nPorts == 0) {
            this.addPort("x", -1, 0);
            this.addPort("f",  1, 0);
         }
         m.save();

         lineWidth(1);
         mCurve([[-1,0],[1,0]]);
         mCurve([[0,-1],[0,1]]);

         this.duringSketch(function() {
            mCurve(makeOval(-.5,-.5,1,1));
         });

         this.afterSketch(function() {

            if (this.aa === undefined)
               this.aa = 0;
            if (this.styleTransition > .5)
               this.aa += 3 * elapsed;

            var e = 1/30;
            _g.globalAlpha = min(this.aa, 1);

            for (var x = -1 ; x <= 1.001 ; x += e)
            for (var y = -1 ; y <  0.999 ; y += e) {
               var z0 = this.f(x,y);
               var z1 = this.f(x,y+e);
               lineWidth(z0+z1>0 ? .25 : .1);
               mCurve([ [x,y,z0], [x,y+e,z1] ]);
            }

            for (var x = -1 ; x <  0.999 ; x += e)
            for (var y = -1 ; y <= 1.001 ; y += e) {
               var z0 = this.f(x,y);
               var z1 = this.f(x+e,y);
               lineWidth(z0+z1>0 ? .25 : .1);
               mCurve([ [x,y,z0], [x+e,y,z1] ]);
            }

            var x = this.isInValue("x") ? this.getInFloat("x") : 0;
            var y = this.isInValue("y") ? this.getInFloat("y") : 0;
            var z = this._f(x,y);
            if (z != null) {
               this.setOutValue("f", z);
            }
         });

         m.restore();
      }
   }
   F2D.prototype = new Sketch;

   function S2C() {
      this.initSketchTo3D("s2c", [ [[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ] ], function() { return root.addCube(); });
   }
   S2C.prototype = new SketchTo3D;

   function C2S() {
      this.initSketchTo3D("c2s", [ makeOval(-1,-1,2,2,20,-PI/2,3*PI/2) ], function() { return root.addGlobe(); });
   }
   C2S.prototype = new SketchTo3D;

   function Flower() {
      this.labels = "flower".split(' ');
      this.tall = 0;
      this.tallTarget = 0;
      this.onSwipe = function(dx,dy) {
         switch(pieMenuIndex(dx,dy)) {
         case 1:
            this.tallTarget = 1;
            break;
         case 3:
            this.tallTarget = 0;
            break;
         }
      }
      this.render = function(elapsed) {
         this.tall = this.tallTarget == 1 ? min(1, this.tall + elapsed)
                                          : max(0, this.tall - elapsed);
         var t = sCurve(this.tall);
         m.save();
         m.translate(0,-1,0);

         // STEM

         mCurve(makeSpline([[0,0],
                            [lerp(t,.08,.16),lerp(t,.5,1)],
                            [0,lerp(t,.8,1.6)],
                            [lerp(t,-.25,-.5),lerp(t,1.4,2.8)],
                            [lerp(t,.25,-.25),lerp(t,2,4)]]
        ));

         // PETALS

         m.save();
         m.translate(lerp(t,.25,-.25),lerp(t,2,4),0);
         for (var i = 0 ; i < 6 ; i++) {
            m.save();
            m.rotateZ(-TAU * (i+lerp(t,2.95,2.5)) / 6);
            m.scale(pow(t+1, .7));
            mCurve(makeSpline([[0,0],[.35,.12],[.5,.06],[.5,-.06],[.35,-.12],[0,0]]));
            m.restore();
         }
         m.restore();

         // LEAVES

         m.translate(0,lerp(t,.5,1),0);
         for (var i = 0 ; i < 2 ; i++) {
            m.save();
               m.rotateZ(i==0 ? -.3 : .5);
               m.translate(lerp(t, i==0?.08:.14, i==0?.17:.24), i==0?0:.2, 0);
               var sgn = i==0 ? -1 : 1;
               mCurve(makeSpline([[0,0],
                              [sgn*lerp(t,.3,0.6),  .2],
                              [sgn*lerp(t,.6,1.2), .01],
                              [sgn*lerp(t,.6,1.2),-.01],
                              [sgn*lerp(t,.3,0.6), -.2],
                              [0,0]]
            ));
               m.restore();
         }

         m.restore();
      }
   }
         // PETALS
   Flower.prototype = new Sketch;

