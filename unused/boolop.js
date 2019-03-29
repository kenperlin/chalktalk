
function() {
   this.label = 'Boolop';
   this.state = 15;
   this.showStateNames = false;

   this.stateNames = [
      "false",
      "a nor b",
      "a and \u00acb",
      "\u00acb",

      "\u00aca and b",
      "\u00aca",
      "a xor b",
      "a nand b",

      "a and b",
      "a = b",
      "a",
      "a or \u00acb",

      "b",
      "\u00aca or b",
      "a or b",
      "true",
   ];

   this.onClick = ['flip bits', function(p) {
      this.flipBit((p.x > 0 ? 1 : 0) + (p.y > 0 ? 2 : 0));
   }];

   this.onCmdClick = function(p) {
      this.showStateNames = ! this.showStateNames;
   }

   this.onSwipe[0] = [ 'a == b', function() { this.state = 9; } ];
   this.onSwipe[2] = [ 'true', function() { this.state = 15; } ];
   this.onSwipe[4] = [ 'a != b', function() { this.state = 6; } ];
   this.onSwipe[6] = [ 'false', function() { this.state = 0; } ];

   this.flipBit = function(i) { var b = 1 << i; this.state = this.state & ~b | (this.state & b ? 0 : 1 << i); }

   this.render = function() {
      this.duringSketch(function() {
         mCurve([[-1,1],[-1,-1],[1,-1]]);
         mCurve([[-1,1],[1,1],[1,-1]]);
      });
      this.afterSketch(function() {
         for (var i = 0 ; i < 4 ; i++) {
            var b = this.state >> i & 1;
            color(fadedColor(b ? 1 : 0.1));
            var x = i == 0 || i == 2 ? -.52 : .52;
            var y = i == 0 || i == 1 ? -.52 : .52;
            mFillRect([x-.48,y-.48],[x+.48,y+.48]);
         }

         if (this.showStateNames) {
            textHeight(this.mScale(.4));
            color(fadedColor(1));
            mText(this.stateNames[this.state], [0,.9], .5,-1);
            color(overlayColor);
            textHeight(this.mScale(.35));
            mText(this.stateNames[ 5], [-.5,-1.15], .5,1);
            mText(this.stateNames[10], [ .5,-1.15], .5,1);
            mText(this.stateNames[ 3], [-1.15,-.5],1, .5);
            mText(this.stateNames[12], [-1.15, .5],1, .5);
         }
      });
   }

   this.output = function() {
      var a = def(this.inValue[0]) ? 1 : 0;
      var b = def(this.inValue[1]) ? 1 : 0;
      return this.state & 1 << (a | b << 1) ? 1 : 0;
   }
}

