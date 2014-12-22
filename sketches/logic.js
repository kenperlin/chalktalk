
   function Delay() {
      this.time = 0;
      this.value = 0;
      this.update = function(value, delayed) {
         if (delayed === undefined)
	    return value;
         if (time > this.time + delayed) {
	    this.value = value;
	    this.time = time;
	 }
	 return this.value;
      }
   }
   var logicDelay = new Delay();

   function delay(value, delayed) {
      return logicDelay.update(value, delayed);
   }

   function Logic() {
      this.labels = "buf and or xor not nand nor xnor".split(' ');

      this.codes = [
         "delay(x>0, y)" , "min(x>0, y>0)",   "max(x>0, y>0)"  , "(x>0)!=(y>0)",
         "delay(1 - (x>0), y)", "1 - min(x>0, y>0)", "1 - max(x>0, y>0)", "(x>0)==(y>0)"
      ];

      this.IDENT = [[-.5,.4],[.5,0],[-.5,-.4],[-.5,.4]];
      this.AND   = [[-.5,.4]].concat(createArc(.1, 0, .4, PI/2, -PI/2, 12))
                             .concat([[-.5,-.4],[-.5,.4]]);
      this.OR    = [[-.5,.4]].concat(createArc( -.2 ,-.4, .80,  PI/2  ,  PI/6  , 12))
                             .concat(createArc( -.2 , .4, .80, -PI/6  , -PI/2  , 12))
                             .concat(createArc(-0.904,  0, .565, -PI/4  ,  PI/4  , 12));
      this.X     =                   createArc(-1.00,  0, .51,  PI/3.5, -PI/3.5, 12);

      this.INVERT = createArc(.6, .0, .1, PI, -PI, 24);

      this.s = -1;

      this.prevTime = 0;

      this.timerStart = 0;
      this.value = 0;

      this.getDelayedValue = function(port) {
         if (time > this.timerStart + this.getInFloat("d")) {
            this.value = this.getInValueOf(port);
            this.timerStart = time;
         }
         return this.value;
      }

      this.logicDelay = new Delay();

      function xor(a, b) { return a == b ? 0 : 1; }

      this.render = function() {
         logicDelay = this.logicDelay;
         var sc = this.size / 180;
         m.scale(sc);
         var s = (this.selection + 1000 * this.labels.length) % this.labels.length;

         if (this.code == null)
	    this.code = [["", this.codes[s]]];

         switch (s % 4) {
         case 0: mCurve(this.IDENT); break;
         case 1: mCurve(this.AND  ); break;
         case 2: mCurve(this.OR   ); break;
         case 3: mCurve(this.X    );
                 mCurve(this.OR   ); break;
         }
         if (s >= 4)
            mCurve(this.INVERT);
/*
         if (s != this.s) {
            this.s = s;
            this.clearPorts();
            if (s % 4 == 0) {
               this.addPort("i", -.5 * sc, 0);
               this.addPort("d",        0, 0);
            }
            else {
               var x = s % 4 < 3 ? -.5 : -.65;
               this.addPort("i", x * sc,  .2 * sc);
               this.addPort("j", x * sc, -.2 * sc);
            }
            this.addPort("o", sc * (s < 4 ? .5 : .6), 0);
         }

         var outValue = this.evalCode(this.code[0][1],
	     s % 4 == 0 ? this.getDelayedValue("i") : this.getInValueOf("i"),
	                                              this.getInValueOf("j"));

	 if (outValue != null)
            this.setOutValue('o', outValue);
*/
         this.setOutPortValue(this.evalCode(this.code[0][1]));
      }
   }
   Logic.prototype = new Sketch;
   addSketchType("Logic");

