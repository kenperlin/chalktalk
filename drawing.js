
var DRAWING = { REVISION: '00' };

DRAWING.Drawing = function() {
   this.children = [];
}

DRAWING.evalArg = function(arg) {
   if (arg.update !== undefined)
      return arg.update();
   else
      return arg;
}

DRAWING.Drawing.prototype = {
   add : function(child) {
      this.children.push(child);
   },
   update : function(child) {
      for (var i = 0 ; i < this.children.length ; i++)
         this.children[i].update();
   },
}

DRAWING.Curve = function(arg) {
   this.arg = arg;
}

DRAWING.Curve.prototype = {
   constructor : DRAWING.Curve,

   update : function() {
      mCurve(DRAWING.evalArg(this.arg));
   },
}

DRAWING.SplinePath = function(arg) {
   this.arg = arg;
   this.splinePoints = [];
}

DRAWING.SplinePath.prototype = {
   constructor : DRAWING.SplinePath,

   update : function() {
      var keys = DRAWING.evalArg(this.arg);
      if (this.splinePoints.length != splineSize(keys))
         this.splinePoints = makeSpline(keys);
      else
         makeSpline(keys, this.splinePoints);
      return this.splinePoints;
   },
}

