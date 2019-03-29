function() {
   this.labels = 'ArrowL ArrowR ArrowU ArrowD'.split(' ');
   this.H = .5;
   this.onPress = function(p) { this.py = p.y; }
   this.onDrag = function(p) {
      this.H += p.y - this.py;
      this.py = p.y;
   }
   this.render = function() {
      var H = this.H;
      lineWidth(6);
      switch (this.labels[this.selection]) {
      case 'ArrowL':
         mCurve([[H-1,H],[-1,0],[H-1,-H]]);
         mLine([-1,0],[1,0]);
         break;
      case 'ArrowR':
         mCurve([[1-H,H],[1,0],[1-H,-H]]);
         mLine([1,0],[-1,0]);
         break;
      case 'ArrowU':
         mCurve([[-H,1-H],[0,1],[H,1-H]]);
         mLine([0,1],[0,-1]);
         break;
      case 'ArrowD':
         mCurve([[-H,H-1],[0,-1],[H,H-1]]);
         mLine([0,-1],[0,1]);
         break;
      }
   }
}
