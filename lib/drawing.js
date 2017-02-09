"use strict";

var DRAWING = { REVISION: '00' };

DRAWING.evalArg = function(arg) {
   if (arg === undefined || arg.update === undefined)
      return arg;
   else
      return arg.update();
}


DRAWING.Circle = function(arg1, arg2, arg3, arg4) {
   this.arg0 = arg1;
   this.arg1 = arg2;
   this.arg2 = arg3;
   this.arg3 = arg4;
}

DRAWING.Circle.prototype = {
   constructor : DRAWING.Circle,

   update : function() {
      mDrawOval(DRAWING.evalArg(this.arg1),
                DRAWING.evalArg(this.arg2),
	        32,
                DRAWING.evalArg(this.arg3),
                DRAWING.evalArg(this.arg4));
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


DRAWING.Drawing = function() {
   this.children = [];
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


DRAWING.Line = function(arg1, arg2) {
   this.arg1 = arg1;
   this.arg2 = arg2;
}

DRAWING.Line.prototype = {
   constructor : DRAWING.Line,

   update : function() {
      mLine(DRAWING.evalArg(this.arg1),
            DRAWING.evalArg(this.arg2));
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


