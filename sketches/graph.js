
function Graph() {
   this.labels = "graph".split(' ');

   this.choice = new Choice();
   this.s = 0;
   var that = this;

   var values, minval, maxval;
   var scrolledBy, sinceLastMeasurement;

   var resetValues = function () {
      scrolledBy = 0;
      sinceLastMeasurement = 1000;
      values = [];

      switch (that.choice.value) {
      case 0:       // AUTO RANGE
         minval = null;
         maxval = null;
         break;
      case 1:       // UNIT RANGE (-1 to 1)
         minval = -1.5;
         maxval = 1.5;
         break;
      case 2:       // LOGIC RANGE (0 to 1)
         minval = -.2;
         maxval = 1;
         break;
      }
   };

   resetValues();

   var recordValue = function (v) {
      if (isDef(v) && v !== null && isNumber(v)) {
         v = Math.round(v*1000)/1000;
         if (values.length == 1 && v == values[0])
            return; // don't start recording until the value is changing

         values.push(v);

         if (that.choice.value == 0) {        // AUTO RANGE
            // update min/max
            if (values.length == 1 || minval === null || maxval === null) {
               minval = v;
               maxval = v;
            }

            maxval = Math.max(maxval, v);
            minval = Math.min(minval, v);
         }
      }
   };

   this.render = function(elapsed) {
      var sc = this.size / 400;

      this.afterSketch(function() {
         if (this.portLocation.length == 0) {
            this.addPort("Y", -sc, 0);
         }
      });

      m.save();
      m.scale(sc);

      var i,y1,y2,scrollAdj;
      mLine([-1,1],[-1,-1]);

      if (this.s != this.choice.value)
          resetValues();
      this.s = this.choice.value;

      // record measurement
      if (this.isInValue("Y")) {

         sinceLastMeasurement += elapsed

         if (sinceLastMeasurement > .0625) {
            if (values.length >= 100) {
               // expire older records if buffer is full
               values.splice(0,1);
               scrolledBy += 1;
            }
            // Capture input
            recordValue(this.getInValue("Y"));

            //sinceLastMeasurement = 0;
         }
      }

      // zero line (if one is in range)
      if (this.choice.value == 2) {
         // LOGIC RANGE, draw the baseline below 0
         mLine([-1,-1],[1,-1]);

      }
	 else if (maxval > 0 && minval <= 0) {
         y1 = -minval/(maxval-minval)*2-1;
         mLine([-1, y1], [1, y1]);
      }
	 else if (values.length < 2) {
         mLine([-1,-1],[1,-1]);
      }

      // render line graph
      if (isDef(values) && values.length > 1) {
         scrollAdj = scrolledBy/100*2;

         dataStart();
         for (i = 1; i < values.length; i++) {
            y1 = (values[i-1]-minval)/(maxval-minval)*2-1;
            y2 = (values[i]-minval)/(maxval-minval)*2-1;
            mLine([(i-1)/100*2-1, y1], [i/100*2-1, y2]);
         }
         dataEnd();
      }

      m.restore();
   };
};
Graph.prototype = new Sketch;
