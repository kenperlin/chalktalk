
function TrackShape(shape) {
   this._delta  = [0,0,0,0,0,0];
   this._matrix = CT.matrixIdentity();
   this._shape  = shape;
}

TrackShape.prototype = {
   eval : function(PP) {
      var d, delta = this._delta, error, k, n, nk = 1000;

      for (k = 0 ; k < nk ; k++)
         for (n = 0 ; n < delta.length ; n++) {
            error = this._computeError(PP);
	    delta[n] += d = (Math.random() - 0.5) * 0.01;
            if (error < this._computeError(PP))
	       delta[n] -= d;
         }
      return this._matrix;
   },
   _computeError : function(PP) {
      var delta = this._delta, dx, dy, error = 0,
          matrix = this._matrix, shape = this._shape;

      CT.identity (matrix);
      CT.translate(matrix, delta[0], delta[1], delta[2]);
      CT.rotateX  (matrix, delta[3]);
      CT.rotateY  (matrix, delta[4]);
      CT.rotateZ  (matrix, delta[5]);

      for (n = 0 ; n < PP.length ; n++) {
         var p = CT.matrixTransform(matrix, shape[n]);
         dx = p[0] * shape[n][2] / p[2] - PP[n][0];
         dy = p[1] * shape[n][2] / p[2] - PP[n][1];
         error += dx * dx + dy * dy;
      }
      return error;
   },
}

