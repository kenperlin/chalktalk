
function Trackball(size) {
   function newMat(n) {
      var mat = [];
      for (var i = 0 ; i < n ; i++) {
         mat.push([]);
         for (var j = 0 ; j < n ; j++)
	    mat[i].push(0);
      }
      return mat;
   }

   this.size = size;
   this.mat = newMat(size);
   this.rot = newMat(size);
   this.tmp = newMat(size);
   this.err = newMat(size);

   this.identity(this.mat);
}

Trackball.prototype = {

   identity : function(mat) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
            mat[row][col] = row == col ? 1 : 0;
   },

// Compute rotation that brings unit length A to nearby unit length B.

   rotate : function(A, B) {
      computeRotation(this.rot, A, B);
      multiply(this.rot);
   },

   computeRotation : function(rot, A, B) {

      // Start with matrix I + product ( 2*transpose(B-A) , A )

      identity(rot);
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
            rot[row][col] += 2 * (B[row] - A[row]) * A[col];

      // Iterate until matrix is numerically orthonormal:

      for (var totalError = 1.0 ; totalError >= 0.00001 ; ) {
     
         // Initialize each row error to 0:

         for (var i = 0 ; i < this.size ; i++)
            for (var k = 0 ; k < this.size ; k++)
                err[i][k] = 0;

         // Add to error between each pair of rows:

         for (var i = 0 ; i < this.size - 1 ; i++) {
            for (var j = i + 1 ; j < this.size ; j++) {
               var t = dot(rot[i], rot[j]);
               for (var k = 0 ; k < this.size ; k++) {
                  err[i][k] += rot[j][k] * t / 2;
                  err[j][k] += rot[i][k] * t / 2;
               }
            }
         }

         // For each row, subtract errors and normalize:

         totalError = 0;
         for (var i = 0 ; i < this.size ; i++) {
            for (var k = 0 ; k < this.size ; k++) {
               rot[i][k] -= err[i][k];
	       totalError += err[i][k] * err[i][k];
            }
            normalize(rot[i]);
         }
      }
   },

   multiply : function(src) {
      this._multiply(src, mat, tmp);
      this.copy(tmp, mat);
   },

   _multiply : function(a, b, dst) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++) {
	    dst[row][col] = 0.0;
            for (var k = 0 ; k < this.size ; k++)
	       dst[row][col] += a[row][k] * b[k][col];
         }
   },

   transform : function(src, dst) {
      _transform(mat, src, dst);
   },

   _transform : function(mat, src, dst) {
      for (var row = 0 ; row < this.size ; row++) {
	 dst[row] = 0.0;
         for (var col = 0 ; col < this.size ; col++)
	    dst[row] += mat[row][col] * src[col];
      }
   },

   copy : function(src, dst) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
	    dst[row][col] = src[row][col];
   },

   dot : function(a, b) {
      var t = 0;
      for (var k = 0 ; k < this.size ; k++)
         t += a[k] * b[k];
      return t;
   },

   normalize : function(a) {
      var s = Math.sqrt(dot(a, a));
      for (var k = 0 ; k < this.size ; k++)
         a[k] /= s;
   },

   transpose : function(src, dst) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
	    dst[col][row] = src[row][col];
   },
}

