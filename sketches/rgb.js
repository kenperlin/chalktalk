function() {
   /*
      Select an rgb color, and send it to the output.
   */
   var colors = ['red','green','blue'];
   this.label = 'rgb';
   this.rgb = [0.5, 0.5, 0.5];
   this.rgb.type = 'color';
   this.onPress = function(p) {
      this.i = max(0, min(2, floor(p.x + 1.5)));
      this.onDrag(p);
   }
   this.onDrag = function(p) {
      this.rgb[this.i] = max(0, min(1, (p.y + 1) / 2));
   }
   this.render = function() {
      this.duringSketch(function() {
         mLine([-1, 0],[ 1, 0]);
      });
      lineWidth(norm(m.transform([.05,0,0,0])));
      color( 'rgb(' + floor(255 * this.rgb[0]) + ',' +
                      floor(255 * this.rgb[1]) + ',' +
                      floor(255 * this.rgb[2]) + ')' );
      for (var i = 0 ; i < 3 ; i++) {
	 var x = (i-1)*2/3;
         mLine([x, 1],[x,-1]);
      }
      this.afterSketch(function() {
         if (this.inValue[0] !== undefined)
	    for (var i = 0 ; i < min(this.inValue[0].length, this.rgb.length) ; i++)
	       this.rgb[i] = max(0, min(1, this.inValue[0][i]));
         lineWidth(norm(m.transform([.1,0,0,0])));
         for (var i = 0 ; i < 3 ; i++) {
            color(colors[i]);
	    var x = (i-1)*2/3;
	    var y = 2 * this.rgb[i] - 1;
            mLine([x-.24, y], [x+.24, y]);
         }
      });
   }
   this.output = function() { return this.rgb; }
}
