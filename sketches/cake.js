function() {
   
   this.label = "cake";
   let sketchCtx = this;

   function makeSpiral(a = 1, b = 14, max = 720) {
      const curve = [];

      for (let i = 0; i < max; i++) {
         const angle = 0.1 * i;
         let x = 1 + (a + b * angle) * cos(angle);
         let y = 1 + (a + b * angle) * sin(angle);

         x /= 200;
         y /= 200;

         curve.push([x, y]);
      }
      return curve;
   }

   function makeFlame() {
      return [[]];
   }

   this.setup = function() {
      function CurveCache() {}
      CurveCache.prototype = {
         c : [],
         beginCurve : function() {
            this.c.push([]);   
         },
         addPoint : function(p) {
            this.c[this.c.length - 1].push(p);
         },
         begin : function() {
            this.c = [];
         },
         clear : function() {
            this.c = [];
         },
         get : function() {
            return this.c;
         },
         get length() {
            return this.c.length;
         },
         get lastCurve() {
            return this.c[this.c.length - 1];
         },
         get lastPoint() {
            const numCurves = this.c.length;
            const numPoints = this.c[numCurves - 1].length;
            return this.c[numCurves - 1][numPoints - 1];
         },
      };

      this.glyphCurves = new CurveCache();
      this.glyphCommandInProgress = false;




      this.glyphs = [
         new SketchGlyph("oval", [makeOval(-1, -1, 1, 1, 32)]),
         new SketchGlyph("square", [[[-1, 1], [1, 1], [1, -1], [-1, -1], [-1, 1]]]),
         new SketchGlyph("line", [[[-1, 1], [1, -1]]]),
         new SketchGlyph("flame", [makeFlame()]),
         new SketchGlyph("wind", [makeSpiral(1, 14, 720 / 7)])
      ];

      this.glyphCommands = {
         "-1" : function() {
            console.log("WE FOUND NOTHING!");
         },
         "0" : function() {
            console.log("WE FOUND AN OVAL!")
         },
         "1" : function() {
            console.log("WE FOUND A SQUARE!")
         },
         "2" : function() {
            console.log("WE FOUND A LINE!")
         },
         "3" : function() {
            console.log("LIGHTING");
            sketchCtx.state = "lit";
         },
         "4" : function() {
            console.log("EXTINGUISHING");
            sketchCtx.state = "unlit";
         }
      }

      this.compareAll = function(curves, glyphs, tolerance = 500) {

         const drawing = new SketchGlyph(null, curves);

         //console.log(drawing);
         //console.log(glyphs[0]);

         let best = {glyph : null, score : drawing.WORST_SCORE, idx : -1};
         
         for (let i = 0; i < glyphs.length; i++) {
            const score = drawing.compare(glyphs[i]);
            if (score < best.score) {
               best.glyph = glyphs[i];
               best.score = score;
               best.idx = i;
            }
         }

         console.log(best.score);

         return best;
      }

      this.recognizeCommand = function(glyphCommandIdx) {
         this.glyphCommands[glyphCommandIdx]();
      }
   };


   this.state = "lit";
   this.states = ["lit", "unlit"];

   this.start = time;
   this.colorIdx = 0;
   this.colors = ["red", "yellow"];



   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([-1, 1], [1, -1]);
         mLine([1, -1], [-1, 1]);
      });

      this.afterSketch(function() {
         mCurve([[-1, 1], [1, 1], [1, -1], [-1, -1], [-1, 1]]);
         //_g.save();
         //color("red");
         //mCurve(makeSpiral(1, 14, 720 / 7));
         //_g.restore();
         // if (!this.isMouseOver && this.glyphCurves.length > 0) {
         //    this.glyphCommandInProgress = false;
         //    this.glyphCurves.clear();
         // }
         // else {
            m.save();
               _g.save();
               lineWidth(10);
               mLine([0, -1], [0, 0]);
               _g.restore();
            m.restore();

            switch (this.state) {
            case "lit":
               _g.save();
               if (time - this.start - Math.random() >= .35) {
                  this.start = time;
                  this.colorIdx = (this.colorIdx + 1) % this.colors.length;
               }
               color(this.colors[this.colorIdx]);
               m.save();
                  m.scale(.04);
                  mFillOval([-1, -2], [1, 2], 36, PI/2, PI/2-TAU);
               m.restore();
               _g.restore();
               break;
            case "unlit":
               break;
            }


            const curves = this.glyphCurves.get();
            lineWidth(1.0);
            color("turquoise");
            for (let i = 0; i < curves.length; i++) {
               mCurve(curves[i]);
            }
         //}
      });


   };


   this.onPress = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }

      // console.log("PRESS");

      this.glyphCurves.beginCurve();
      this.onDrag(p);
   };
   this.onDrag = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }

      // console.log("DRAG");
      
      this.glyphCurves.addPoint([p.x, p.y]);

   };
   this.onRelease = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }

      const lcl = this.glyphCurves.lastCurve.length;
      if (lcl > 1) {
         return;
      }
      // console.log("RELEASE_ONE_POINT");

      // console.log(this.glyphCurves.get());

      const lp = this.glyphCurves.lastPoint;
      if (lp[0] == p.x && lp[1] == p.y) {
         this.glyphCurves.get().pop();
         // TRY TO RECOGNIZE A COMMAND

         const comp = this.compareAll(this.glyphCurves.get(), this.glyphs);
         const idx = comp.idx;
         this.recognizeCommand(idx);
         this.glyphCommandInProgress = false;
         this.glyphCurves.clear();
      }
   };


   this.onCmdPress = function(p) {
      if (this.glyphCommandInProgress) {
         return;
      }

      // console.log("CMD_PRESS");

      this.glyphCommandInProgress = true;

      this.glyphCurves.beginCurve();
      this.onCmdDrag(p);
   };
   this.onCmdDrag = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }
      
      // console.log("CMD_DRAG");
      this.glyphCurves.addPoint([p.x, p.y]);
      
   };
   this.onCmdRelease = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }

      const lcl = this.glyphCurves.lastCurve.length;
      if (lcl > 1) {
         return;
      }
      // console.log("CMD_RELEASE_ONE_POINT");

      const lp = this.glyphCurves.lastPoint;
      if (lp[0] == p.x && lp[1] == p.y) {
         this.glyphCommandInProgress = false;
         this.glyphCurves.clear();
      }
   };
}
