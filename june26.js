/*
    For June 26, 2014 talk.
    With more stuff added for July 7 talk.
*/

   registerGlyph("cupSketch()", [

      // TEMPLATE TO MATCH FOR THE FREEHAND SKETCH OF THE COFFEE CUP.

      [ [ -1,1 ], [ -1,-1 ], [ 1,-1 ], [1,1 ] ],    // SIDES AND BOTTOM.
      [ [ 1,1], [-1,1], [1,1] ],                 // TOP.
      makeOval(-1.6,-.6, 1.2, 1.2, 20, PI/2, 3*PI/2),      // OUTER HANDLE.
      makeOval(-1.4,-.4, 0.8, 0.8, 20, PI/2, 3*PI/2),      // INNER HANDLE.
   ]);

   function cupSketch() {
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
      coffee.getMatrix().translate(0,0,.9).rotateX(PI/2).scale(.95,.01,.95);

      node.setMaterial(whiteMaterial);
      coffee.setMaterial(new phongMaterial().setAmbient(.07,0,0));

      var sketch = geometrySketch(node, [0.1,0,0,-PI/2,0.9]);
      sketch.swirlMode = -1;

      sketch.coffee = coffee;

      sketch.mouseDrag = function() { }

      sketch.swipe[0] = ['swirl', function() {
         this.swirlMode = 0;
         this.swirlStartTime = time;
         this.cream = [];
         for (var i = 0 ; i < 100 ; i++) {
            var t = i / 100;
            this.cream.push( [ mix(-1, 1, t) , 0 ] );
         }
      }];

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
               var f = mix(.995, 1, 1 - rr);
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
            _g.lineWidth = (this.xhi - this.xlo) * mix(.0025, .005, fade * fade);
            _g.strokeStyle = 'rgba(255,255,255,' + (1-fade) + ')';
            _g.beginPath();

            var scale = mix(.55, .75, dt/5), xPrev = 0, yPrev = 0;
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

            sketch.coffee.setMaterial(new phongMaterial().setAmbient(mix(.07,.16,fade*fade),0,0));

            _g.stroke();
            _g.restore();
         }
      }
   }

   function Motion() {
      this.labels = "motion".split(' ');
      this.dragValue = 1;
      var d = 0.3;

      this.mouseDrag = function(x, y) {
         var x0 = this.xlo + sketchPadding;
         var x1 = this.xhi - sketchPadding;
         this.dragValue = (x - x0) / (x1 - x0);
      }

      this.render = function(elapsed) {
         motion[this.colorId] = max(0, min(1, isDef(this.in[0]) ? this.inValue[0] : this.dragValue));
         m.save();
            m.scale(this.size / 360);
            mLine([-1,0],[1,0]);
            mCurve([[1-d,d],[1,0],[1-d,-d]]);
            m.translate(2 * motion[this.colorId] - 1, 0, 0);
            mLine([0,d],[0,-d]);
         m.restore();
      }
   }
   Motion.prototype = new Sketch;
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

var flameFragmentShader = ["\
void main(void) {\n\
   vec3 p = vPosition;\n\
   float nx = .5 * noise(.1*p);\n\
   float ny = .5 * noise(.1*p + vec3(100., 0., 0.));\n\
   float s = .25*p.z+turbulence(vec3(p.x+nx,p.y+ny,p.z+.3*uTime));\n\
   float ss = s * s;\n\
   vec3 color = mix(vec3(.35,0.,0.),\n\
                    s * vec3(1.,ss,ss*ss), min(1.,2.*vNormal.z));\n\
   gl_FragColor = vec4(color, alpha);\n\
}\
"].join("\n");


var slicedFragmentShader = ["\
   uniform float frequency;\n\
   uniform float spinAngle;\n\
   void main(void) {\n\
      float x = vPosition.x;\n\
      float y = vPosition.y;\n\
      float rr = x*x + y*y;\n\
      float z = rr >= 1. ? 0. : sqrt(1. - rr);\n\
      float dzdx = -1.3;\n\
      float zp = dzdx * (x - mx * 1.3 - .2);\n\
      if (zp < -z)\n\
         rr = 1.;\n\
      vec3 color = vec3(0.);\n\
      if (rr < 1.) {\n\
         vec3 nn = vec3(x, y, z);\n\
         if (zp < z) {\n\
            z = zp;\n\
            nn = normalize(vec3(-dzdx,0.,1.));\n\
         }\n\
         float s = rr >= 1. ? 0. : .3 + max(0., dot(vec3(.3), nn));\n\
         float X =  x * cos(spinAngle) + z * sin(spinAngle);\n\
         float Y =  y;\n\
         float Z = -x * sin(spinAngle) + z * cos(spinAngle);\n\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\n\
         float t = selectedIndex == 3. ? 0.7 * noise(vec3(X,Y,Z)) :\n\
                   selectedIndex == 5. ? 0.5 * fractal(vec3(X,Y,Z)) :\n\
                   selectedIndex == 6. ? 0.8 * (turbulence(vec3(X,Y,Z+20.))+1.8) :\n\
                                    0.0 ;\n\
         float c = .5 + .5*cos(7.*X+6.*t);\n\
         if (selectedIndex == 1.)\n\
            c = .2 + .8 * c;\n\
         else if (selectedIndex == 0.) {\n\
	    float f = 3. * frequency;\n\
            c = .5 + .4 * noise(vec3(f*X,f*Y,f*Z));\n\
         }\n\
         else if (selectedIndex == 4.)\n\
            c = .5 + .4 * fractal(vec3(3.*X,3.*Y,3.*Z));\n\
         else\n\
            c = pow(c, .1);\n\
         color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\n\
         if (nn.x > 0.) {\n\
            float h = .2 * pow(dot(vec3(.67,.67,.48), nn), 20.);\n\
            color += vec3(h*.4, h*.7, h);\n\
         }\n\
         else {\n\
            float h = .2 * pow(dot(vec3(.707,.707,0.), nn), 7.);\n\
            color += vec3(h, h*.8, h*.6);\n\
         }\n\
      }\n\
      gl_FragColor = vec4(color,alpha*(rr<1.?1.:0.));\n\
   }\
"].join("\n");

registerGlyph("sliced()",[
   makeOval(-1, -1, 2, 2, 32,  PI*0.5, PI*2.5),
   makeOval( 0,  0, 1, 1, 32,  PI*0.5, PI*2.0),
]);

function sliced() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, slicedFragmentShader);
   sketch.code = [
      ["noise", ".5 + .5 * noise(x,y,z))"],
      ["stripe", ".5 + .5 * sin(x)      "],
      ["pinstripe", "pstripe(x) = pow(.5 + .5 * sin(x), 0.1)"],
      ["add noise", "pstripe(x + noise(x,y,z))"],
      ["fractal", "fractal(x,y,z))     "],
      ["add fractal", "pstripe(x + fractal(x,y,z))"],
      ["add turbulence", "pstripe(x + turbulence(x,y,z))"],
   ];
   sketch.mouseDrag = function(x, y) {}
   sketch.spinRate = 0;
   sketch.spinAngle = 0;

   sketch.swipe[2] = ['less spin', function() { this.spinRate = -.5 - this.spinRate; }];
   sketch.swipe[6] = ['more spin', function() { this.spinRate = 0; }];

   sketch.update = function(elapsed) {
      this.setUniform('spinAngle', this.spinAngle += elapsed * this.spinRate);
      this.setUniform('frequency', this.in.length > 0 ? this.inValue[0] : 1);
   }
}

