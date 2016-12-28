
function() {
   this.label = 'star';  
   this.nSides = 3;
   this.onSwipe[2] = ['more sides', function() { this.nSides += 2; }];
   this.onSwipe[6] = ['fewer sides', function() { this.nSides = max(3, this.nSides - 2); }];
   this.render = function() {
      var c = [], n = floor(this.nSides / 2);
      for (var i = 0 ; i <= this.nSides ; i++) {
         var a = n * TAU * i / this.nSides;
	 c.push([sin(a),cos(a)]);
      }
      mLines(c);
   }
}
