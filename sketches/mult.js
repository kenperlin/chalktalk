
function mult(x,y) {
   function pad(v) {
      var dst = [];
      for (var i = 0 ; i < 4 ; i++)
         dst.push(i < v.length ? v[i] : i<3 ? 0 : 1);
      return dst;
   }
   function v_v(a, b) {
      var value = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
      return value;
   }
   function mXm(x, y) {
      var dst = [];
      for (var r = 0 ; r < 4 ; r++)
      for (var c = 0 ; c < 4 ; c++)
         dst.push(v_v([x[  r], x[4   + r], x[8   + r], x[12  + r]],
                      [y[4*c], y[4*c + 1], y[4*c + 2], y[4*c + 3]]));
      return dst;
   }
   function mXv(x, y) {
      var dst = [];
      for (var r = 0 ; r < 4 ; r++)
         dst.push(v_v([x[r], x[4 + r], x[8 + r], x[12 + r]], y));
      return dst;
   }
   function vXm(x, y) {
      var dst = [];
      for (var c = 0 ; c < 4 ; c++)
         dst.push(v_v(x, [y[4*c], y[4*c + 1], y[4*c + 2], y[4*c + 3]]));
      return dst;
   }
   var dst = 0;
   var xIsArray = Array.isArray(x);
   var yIsArray = Array.isArray(y);
   if (! xIsArray && ! yIsArray) {
      dst = x * y;
   }
   else if (xIsArray && ! yIsArray) {
      var dst = [];
      for (var i = 0 ; i < x.length ; i++)
         dst.push(x[i] * y);
   }
   else if (! xIsArray && yIsArray) {
      var dst = [];
      for (var i = 0 ; i < y.length ; i++)
         dst.push(x * y[i]);
   }
   else {
      dst = max(x.length, y.length)  < 16 ? v_v(pad(x), pad(y))
          : min(x.length, y.length) == 16 ? mXm(x, y)
          : x.length                == 16 ? mXv(x, pad(y))
                                          : vXm(pad(x), y);
   }
   return dst;
}
function Mult() {
   this.label = "mult";
   this.code = [["","mult(x,y)"]];
   this.render = function() {
      mLine( [-1, 1], [ 1, -1] );
      mLine( [ 1, 1], [-1, -1] );
      if (isDef(this.in[0]) && isDef(this.in[1]))
         this.outValue[0] = mult(this.inValue[0], this.inValue[1]);
   }
}
Mult.prototype = new Sketch;
addSketchType("Mult");
