function() {
   this.label = 'textbox';
   this._isDone = false;
   this._p = [];
   this.onPress = function(p) {
      this._p.push([[p.x,p.y]]);
   }
   this.onDrag = function(p) {
      this._p[this._p.length-1].push([p.x,p.y]);
   }
   this.onRelease = function(p) {
      if (this._p[this._p.length-1].length == 1)
         this._isDone = true;
   }
   this.render = function() {
      mClosedCurve([[-1,.4],[1,.4],[1,-.4],[-1,-.4]]);
      this.afterSketch(function() {
         lineWidth(this._isDone ? 1 : 4);
         for (var i = 0 ; i < this._p.length ; i++)
            mCurve(this._p[i]);
      });
   }
}
