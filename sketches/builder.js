function() {
   this.label = 'builder';

   this.openOutput = false;

   this._a = [0, 0];
   this._b = [0, 0];

   let thatSketch = this;

   function Grid(distX, distY, pLeft, pRight, color, strokeWidth) {
      this._distX = distX || 0.20;
      this._distY = distY || 0.20;
      this._pLeft  = pLeft || [-1.0, 1.0];
      this._pRight  = pRight || [1.0, -1.0];
      this.color = color || "violet";
      this.strokeWidth = strokeWidth || 0.5;

      this._initAnimation = true;

      this.isMutated = true;

      this._drawQ = [];

      this._boundControlOffset = 0.1;
      this._boundControlTolerance = 0.1;

      this.selectBound = "none";

      this.snapIsOn = true;

   }
   Grid.prototype = {
      snap : function(p) {
         function snapOne(val, gridDelta) {
            return gridDelta * Math.round(val / gridDelta); 
         }

         return [snapOne(p[0], this.distX), snapOne(p[1], this.distY)];      
      },
      toggleSnap : function() {
         this.snapIsOn = !this.snapIsOn;
      },
      _drawBoundControls : function() {
         let pL = [0, 0];
         let pR = [0, 0];
         let scale = this._boundControlOffset;
         let d = 1.0;

         _g.save();
         color("turquoise");
         let x = 0.0;
         let y = 0.0;

         m.save();
            m.translate([this._pLeft[0], this._pLeft[1], 0.0]);
            m.scale(scale);
            mCurve([pL, [x + d, y], [x + d, y + d], [x - d, y + d], [x - d, y - d], [x, y - d], pL]);
         m.restore();
         
         color("turquoise");
         m.save();
            m.translate([this._pRight[0], this._pRight[1], 0.0]);
            m.scale(scale);
            mCurve([pR, [x - d, y], [x - d, y - d], [x + d, y - d], [x + d, y + d], [x, y + d], pR]);
         m.restore();
         _g.restore();
      },
      draw : function(elapsed) {
         _g.save();
         lineWidth(this.strokeWidth);

         let Q = null;

         this._elapsed = elapsed;
         
         if (this.isMutated || this._drawQ.length == 0) { // CONIDTION IS WRONG, SHOULD CREATE A TRANSITION STATE FLAG OR USE A STATE MACHINE INSTEAD OF CHECKING DRAW QUEUE LENGTH, WHICH IS NOT REALLY RELATED
            this._drawQ = [];
            Q = this._drawQ;

            let qXLeft = [];
            let qXRight = [];
            let qYUp = [];
            let qYDown = [];

            let pR = this._pRight;
            let pL = this._pLeft;

            let that = this;

            if (this._initAnimation) {

               // VERTICAL LINES TO THE RIGHT OF ORIGIN
               for (let x = 0, bound = pR[0]; x <= bound; x+= this.distX) {
                  function* gen() {
                     let ani = new SketchAnimation.Animation(
                        SketchAnimation.Type.LINE({
                           start : new Location.Position(x, pL[1], 0), 
                           end : new Location.Position(x, pR[1], 0)
                        }),
                        .05,
                        true
                     );

                     while (true) {
                        let ret = ani.step(that._elapsed);
                        mLine([x, pL[1]], [x, ret.point[1]]);
                        yield ret;                    
                     } 
                  }

                  let genInst = gen();
                  qXRight.push(function() { return genInst.next().value; });
               }
               // VERTICAL LINES TO THE LEFT OF ORIGIN, MOVING LEFTWARDS
               for (let x = -this._distX, bound = pL[0]; x >= bound; x-= this._distX) {
                  function* gen() {
                     let ani = new SketchAnimation.Animation(
                        SketchAnimation.Type.LINE({
                           start : new Location.Position(x, pL[1], 0), 
                           end : new Location.Position(x, pR[1], 0)
                        }),
                        .05,
                        true
                     );

                     while (true) {
                        let ret = ani.step(that._elapsed);
                        mLine([x, pL[1]], [x, ret.point[1]]);
                        yield ret;                    
                     } 
                  }

                  let genInst = gen();
                  qXLeft.push(function() { return genInst.next().value; });
               }
               // HORIZONTAL LINES ABOVE ORIGIN
               for (let y = 0, bound = pL[1]; y <= bound; y+= this._distY) {
                  function* gen() {
                     let ani = new SketchAnimation.Animation(
                        SketchAnimation.Type.LINE({
                           start : new Location.Position(pL[0], y, 0), 
                           end : new Location.Position(pR[0], y, 0)
                        }),
                        .05,
                        true
                     );

                     while (true) {
                        let ret = ani.step(that._elapsed);
                        mLine([pL[0], y], [ret.point[0], y]);
                        yield ret;                    
                     } 
                  }

                  let genInst = gen();
                  qYUp.push(function() { return genInst.next().value; });
               }
               // HORIZONTAL LINES BELOW ORIGIN
               for (let y = -this._distY, bound = pR[1]; y >= bound; y-= this._distY) {
                  function* gen() {
                     let ani = new SketchAnimation.Animation(
                        SketchAnimation.Type.LINE({
                           start : new Location.Position(pL[0], y, 0), 
                           end : new Location.Position(pR[0], y, 0)
                        }),
                        .05,
                        true
                     );

                     while (true) {
                        let ret = ani.step(that._elapsed);
                        mLine([pL[0], y], [ret.point[0], y]);
                        yield ret;                    
                     } 
                  }

                  let genInst = gen();
                  qYDown.push(function() { return genInst.next().value; });
               }
            }
            else {
               // VERTICAL LINES TO THE RIGHT OF ORIGIN
               for (let x = 0, bound = pR[0]; x <= bound; x+= this._distX) {
                  if (x < pL[0]) {
                     continue;
                  }
                  qXRight.push(function() { mLine([x, pL[1]], [x, pR[1]]); });
               }
               // VERTICAL LINES TO THE LEFT OF ORIGIN, MOVING LEFTWARDS
               for (let x = -this._distX, bound = pL[0]; x >= bound; x-= this._distX) {
                  if (x > pR[0]) {
                     continue;
                  }
                  qXLeft.push(function() { mLine([x, pL[1]], [x, pR[1]]); });
               }
               // HORIZONTAL LINES ABOVE ORIGIN
               for (let y = 0, bound = pL[1]; y <= bound; y+= this._distY) {
                  if (y < pR[1]) {
                     continue;
                  }
                  qYUp.push(function() { mLine([pL[0], y], [pR[0], y]); });
               }
               // HORIZONTAL LINES BELOW ORIGIN
               for (let y = -this._distY, bound = pR[1]; y >= bound; y-= this._distY) {
                  if (y > pL[1]) {
                     continue;
                  }
                  qYDown.push(function() { mLine([pL[0], y], [pR[0], y]); });
               }
            }


            for (let i = qXLeft.length - 1; i >= 0; i--) {
               Q.push(qXLeft[i]);
            }
            for (let i = 0; i < qXRight.length; i++) {
               Q.push(qXRight[i]);
            }
            for (let i = qYUp.length - 1; i >= 0; i--) {
               Q.push(qYUp[i]);
            }
            for (let i = 0; i < qYDown.length; i++) {
               Q.push(qYDown[i]);
            }
         }

         Q = this._drawQ;

         _g.save();
         color(this.color);
         if (this._initAnimation) {
            let unfinished = false;
            for (let i = 0; i < Q.length; i++) {
               let ret = Q[i]();
               if (!ret.finished) {
                  unfinished = true;
                  break;
               }
            }
            this._initAnimation = unfinished;
            if (!this._initAnimation) {
               this._drawQ = [];
            }
         } else {
            for (let i = 0; i < Q.length; i++) {
               Q[i]();
            }
            lineWidth(1);
            this._drawBoundControls();           
         }
         _g.restore();
         _g.restore();

         this.isMutated = false;
      },
      get distX() {
         return this._distX;
      },
      set distX(val) {
         this._distX = val;
         this.isMutated = true;
      },

      get distY() {
         return this._distY;
      },
      set distY(val) {
         this._distY = val;
         this.isMutated = true;
      },

      get pLeft() {
         return [this._pLeft[0], this._pLeft[1]];
      },
      set pLeft(val) {
         this._pLeft[0] = val[0];
         this._pLeft[1] = val[1];
         this.isMutated = true;
      },
      
      get pRight() {
         return [this._pRight[0], this._pRight[1]];
      },
      set pRight(val) {
         this._pRight[0] = val[0];
         this._pRight[1] = val[1];
         this.isMutated = true;
      },

      get pLeftBoundControl() {
         return [
            this._pLeft[0] - this._boundControlOffset,
            this._pLeft[1] + this._boundControlOffset
         ];
      },
      get pRightBoundControl() {
         return [
            this._pRight[0] + this._boundControlOffset,
            this._pRight[1] - this._boundControlOffset
         ];
      }
   }

   this.setup = function() {
      this.drawElementList = [];
      this.curElement = [];
      this.pressed = false;

      this.sketchStubName = "newsketchstub.js";

      this.grid = new Grid();



      let that = this;

      function DrawElement(drawFunc, toCodeTextFunc, argList) {
         this.self = {};
         if (argList !== undefined && argList !== null) {
            for (let i = 0; i < argList.length - 1; i+= 2) {
               this.self[argList[i]] = argList[i + 1];
            }
         }

         let that = this;

         this.draw = function() {
            drawFunc(that.self);
         };

         this.toCodeText = function() {
            return toCodeTextFunc(that.self);
         };
      }

      this.drawProcedures = {
         line : function(p, isTemp) {
            p = [p[0], p[1]];
            if (that.curElement.length == 0) {
               that.curElement.push(p);
            } 
            else {
               let p1 = that.curElement[0];
               if (p1[0] != p[0] || p1[1] != p[1]) {
                  let curP1 = that.curElement[0];
                  let curP2 = [p[0], p[1]]; 
                  
                  that.drawElementList.push(new DrawElement(
                        function(self) {
                           mLine(self.curP1, self.curP2);
                        },
                        function(self) {
                           return "" + 
                           "      mLine([" + self.curP1 + "], [" + self.curP2 + "]);\n" +
                           "";
                        },
                        ["curP1", curP1, "curP2", curP2]
                     )
                  );

                  that.resetCurElement();
               }
            }         
         },
         oval : function(p) {
            p = [p[0], p[1]];
            if (that.curElement.length == 0) {
               that.curElement.push(p);
            } else {
               let center = that.curElement[0];
               let cx = center[0];
               let cy = center[1];
               if (cx != p[0] || cy != p[1]) {
                  let dx = p[0] - cx;
                  let dy = p[1] - cy;
                  let dist = Math.sqrt((dx * dx) + (dy * dy));
                  
                  that.drawElementList.push(new DrawElement(
                        function(self) {
                           m.save();
                              m.translate(self.cx, self.cy, 0);
                              mDrawOval([-1 * self.dist, -1 * self.dist],[1 * self.dist, 1 * self.dist], 36, PI/2, PI/2-TAU);
                           m.restore();
                        },
                        function(self) {
                           return "" +
                           "      m.save();\n" +
                           "         m.translate(" + self.cx + ", " + self.cy + ", " + 0 + ");\n" +
                           "         mDrawOval([-1 * " + self.dist + ", -1 * " + self.dist + "],[1 * " + self.dist + ", 1 * " + self.dist + "], 36, PI/2, PI/2-TAU);\n" +
                           "      m.restore();\n" +
                           "";
                        },
                        ["cx", cx, "cy", cy, "dist", dist]
                     )
                  );

                  that.resetCurElement();
               }
            }
         }
      };

      this.drawProcedure = this.drawProcedures.line;

      this.drawProcedures.line.temp = function(p) {
         if (that.curElement.length === 0) {
            return;
         }
         let p1 = that.curElement[0];
         if (p1[0] != p[0] || p1[1] != p[1]) {
            mLine(that.curElement[0], p);
         }
      };

      this.drawProcedures.oval.temp = function(p) {
         if (that.curElement.length === 0) {
            return;
         }

         let center = that.curElement[0];
         let cx = center[0];
         let cy = center[1];
         if (cx != p[0] || cy != p[1]) {
            let dx = p[0] - cx;
            let dy = p[1] - cy;
            let dist = Math.sqrt((dx * dx) + (dy * dy));

            m.save();
               m.translate(cx, cy, 0);
               mDrawOval([-1 * dist, -1 * dist],[1 * dist, 1 * dist], 36, PI/2, PI/2-TAU);
            m.restore();

         }
      }

      this.onSwipe[0] = [
         "select draw type",
         function() { 
            that.drawProcedure = (that.drawProcedure === that.drawProcedures.line) ? 
            that.drawProcedures.oval : that.drawProcedures.line;
            that.curElement = [];
         }
      ];

      // this.onSwipe[4] = [
      //    "clear",
      //    function() {
      //       that.drawElementList = [];
      //       that.resetCurElement();
      //    }
      // ];

      this.onSwipe[2] = [
         "save as sketch",
         function() {
            //server.writeFile('sketches/builderstubs/WEE.js', this.drawElementList.toString());
            server.writeFile('sketches/__' + this.sketchStubName + '.js', 
                             "function() {\n" + 
                             "   this.label = \"" + this.sketchStubName + "\"\n\n" + 
                             "   this.setup = function() {\n" + 
                             "   };\n\n" + 
                             "   this.render = function(elapsed) {\n" +
                             "" + this.drawElementsToSketchStub() + 
                             "      this.duringSketch(function() {\n" +
                             "         /*TODO*/\n" +
                             "      });\n\n" + 
                             "      this.afterSketch(function() {\n" +
                             "         /*TODO*/\n" +
                             "      });\n\n" + 
                             "   };\n\n" +
                             "   this.output = function() {\n" +
                             "      /*TODO*/\n" +
                             "   };\n\n" +
                             "}\n"
            );
         }
      ];

      this.onSwipe[6] = [
         "set grid divisions to 0.1",
         function() {
            this.grid.distX = 0.1;
            this.grid.distY = 0.1;
         }
      ];

   };

   this.drawElementsToSketchStub = function() {
      let toSave = this.drawElementList;
      let code = [];
      for (let i = 0; i < toSave.length; i++) {
         code.push(toSave[i].toCodeText());
      }
      code.push('\n');

      return code.join('');
   };

   this.resetCurElement = function() {
      this.curElement = [];
   }


   this.checkAndUpdateInputs = function(grid, inVal) {
      let val = null;
      if (def(inVal[0])) {
         val = max(0.01, inVal[0]);
         grid.distX = val;
         if (def(inVal[1])) {
            val = max(0.01, inVal[1]);
            grid.distY = val;
         }
         else {
            grid.distY = val;
         }
      }

      return (val !== null);

   };

   this.render = function(elapsed) {

      this.duringSketch(function() {
         mCurve([[-1, 1], [1, 1], [1, -1], [-1, -1], [-1, 1]]);
         mCurve([[-1, 1], [-1.3, -1], [-1, -1]]);
      });

      this.afterSketch(function() {

         let hasInput = this.checkAndUpdateInputs(this.grid, this.inValue);
         if (hasInput || this.isMouseOver || this.grid._initAnimation) {
            this.grid.draw(elapsed);
         }
         else {
            this.grid._drawBoundControls();
         }

         if (!this.isMouseOver) {
            this.resetCurElement();
         }
         this.drawAll();
         //this.drawIncomplete(this._b);
         if (this.pressed) {
            this.drawOnPressed(this._a);
            this.pressed = false;
         }

         ////BROKEN
         let l = this.grid.pLeft; // COPIES, NOT ORIGINAL
         let r = this.grid.pRight;

         let delta = 0.4;

         l[0]-= delta;
         l[1]+= delta;
         r[0]+= delta;
         r[1]-= delta;

         let tr = [r[0], l[1]];
         let bl = [l[0], r[1]];

         _g.save();
         lineWidth(this.grid.strokeWidth);
         m.save();;
            mLine(l, tr);
            mLine(tr, r);
            mLine(r, bl);
            mLine(bl, l);
         m.restore();
         _g.restore();


      });
   };

   this.gridDelta = 0.25;

   this.drawGrid = function() {
      _g.save();
      color("violet");
      for (let i = -1; i <= 1; i += this.gridDelta) {
         mLine([-1, i], [1, i]); // horizontal
         mLine([i, -1], [i, 1]); // vertical
      }
      _g.restore();
   };

   this.drawAll = function() {
      for (let i = 0; i < this.drawElementList.length; i++) {
         this.drawElementList[i].draw();
      }
   };

   this.drawIncomplete = function(p) {
      this.drawProcedure.temp(p);
   }

   this.drawOnPressed = function(p) {

      //return;
      // TODO

      let r = 0.05;
      m.save();
      _g.save();
         color("white");
         m.translate(p[0], p[1], 0);
         mDrawOval([-r, -r],[r, r], 36, PI / 2 , PI / 2 - TAU);
      _g.restore();
      m.restore();
   };


   this.isNear = function(a,b,t) {
      t = def(t, this._tolerance);
      return abs(a[0] - b[0]) < t && abs(a[1] - b[1]) < t;
   };



   this.onPress = function(p) {
      this._a[0] = p.x;
      this._a[1] = p.y;


      if (this.isNear(this._a, this.grid.pLeftBoundControl, 0.2)) {
         this.grid.selectBound = "leftControl";
      } 
      else if (this.isNear(this._a, this.grid.pRightBoundControl, 0.2)) {
         this.grid.selectBound = "rightControl";
      } 
      else {
         this.grid.selectBound = "none";

         // SNAP
         if (this.grid.snapIsOn) {
            this._a = this.grid.snap(this._a);
         }

         let pa = this._a;
         let l = this.grid._pLeft;
         let r = this.grid._pRight
         if (pa[0] < l[0] || pa[0] > r[0] ||
             pa[1] > l[1] || pa[1] < r[1]) {
            this.grid.selectBound = "invalid";
         }
         else {
            this.drawProcedure(this._a);
            this.pressed = true;
         }
      }

   };

   this.onDrag = function(p) { 
      this.curLine = [];

      this._b[0] = p.x;
      this._b[1] = p.y;

      let ax = abs(this._b[0] - this._a[0]);
      let ay = abs(this._b[1] - this._a[1]);
      if (max(ax, ay) < this.grid._boundControlTolerance) {
         return;
      }

      let pLeft = this.grid.pLeft;
      let pRight = this.grid.pRight;

      switch (this.grid.selectBound) {
      case "rightControl":
         if (this._b[0] <= pLeft[0] ||
             this._b[1] >= pLeft[1]) {
            break;
         }
         if (this.isNear(this.grid.pLeftBoundControl, this._b, 0.3)) {
            break;
         }
         this.grid.pRight = this._b;
         break;
      case "leftControl":
         if (this._b[0] >= pRight[0] ||
             this._b[1] <= pRight[1]) {
            break;
         }
         if (this.isNear(this.grid.pRightBoundControl, this._b, 0.3)) {
            break;
         }
         this.grid.pLeft = this._b;
         break;
      case "none" :
         // SNAP
         if (this.grid.snapIsOn) {
            this._b = this.grid.snap(this._b);
         }

         let offset = 0.5;
         let tolerance = 0.2;
         let original = null;
         if (abs(this._b[0] - this.grid.pRight[0]) <= tolerance) {
            original = this.grid.pRight;
            this.grid.pRight = [original[0] + offset, original[1]];
         }
         else if (abs(this._b[0] - this.grid.pLeft[0]) <= tolerance) {
            original = this.grid.pLeft;
            this.grid.pLeft = [original[0] - offset, original[1]];
         }
         if (abs(this._b[1] - this.grid.pRight[1]) <= tolerance) {
            original = this.grid.pRight;
            this.grid.pRight = [original[0], original[1] - offset];
         }
         else if (abs(this._b[1] - this.grid.pLeft[1]) <= tolerance) {
            original = this.grid.pLeft;
            this.grid.pLeft = [original[0], original[1] + offset];
         }
         break;
      default :
         break;
      }
   };

   this.onRelease = function(p) {
      //this.grid.selectBound = "none";
   }

   this.intersect = function(other) {

   };

   this.mouseDown = function(x, y, z) {
   };

   // TEST
   this.over = function(other) {

   };

   // TEST
   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      this.sketchStubName = other.output();
      other.fade();
      //other.delete();
   };

   this.output = function() {
   
   };
}