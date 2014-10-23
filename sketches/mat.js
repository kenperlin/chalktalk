
   function Mat() {
      function rounded(x) { return floor(x * 100) / 100; }
      var c = "cos";
      var s = "sin";
      var nc = "-cos";
      var ns = "-sin";
      this.labels = "mat".split(' ');
      this.vals = [
          [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
          [1,0,0,0, 0,1,0,0, 0,0,1,0, "A","B","C",1],
          [1,0,0,0, 0,"A","B",0, 0,"C","A",0, 0,0,0,1],
          ["A",0,"C",0, 0,1,0,0, "B",0,"A",0, 0,0,0,1],
          ["A","B",0,0,"C","A",0,0, 0,0,1,0, 0,0,0,1],
          ["sx",0,0,0, 0,"sy",0,0, 0,0,"sz",0, 0,0,0,1],
      ];
      this.mode = 0;
      this.onClick = function(x, y) {
         this.mode = (this.mode + 1) % this.vals.length;
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

	    var sub = ["x","y","z"];
	    switch (this.mode) {
	    case 1: sub = ["tx","ty","tz"]; break;
	    case 2:
	    case 3:
	    case 4: sub = ["cos","sin","-sin"]; break;
	    case 5: sub = ["sx","sy","sz"]; break;
	    }

	    if (isDef(this.in[0])) {
	       switch (this.mode) {
	       case 2:
	       case 3:
	       case 4:
	          sub[0] = rounded(cos(this.inValue[0]));
	          sub[1] = rounded(sin(this.inValue[0]));
	          sub[2] = -sub[1];
		  break;
	       case 5:
	          sub[0] =
	          sub[1] =
	          sub[2] = rounded(this.inValue[0]);
		  break;
	       }
	    }

            var vals = this.vals[this.mode];
            for (var i = 0 ; i < 4 ; i++)
            for (var j = 0 ; j < 4 ; j++) {
               var x = (j - 1.5) / 2;
               var y = (1.5 - i) / 2;

               var val = "" + vals[i + 4 * j];
	       if (val == "A") val = "" + sub[0];
	       if (val == "B") val = "" + sub[1];
	       if (val == "C") val = "" + sub[2];

               textHeight((this.xhi - this.xlo) / 8 / sqrt(val.length));

               mText(val, [x, y], .5, .5);
            }
         });
         m.restore();
      }
   }
   Mat.prototype = new Sketch;
   addSketchType("Mat");

