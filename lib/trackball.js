"use strict";

function Trackball(size) {
/*
   function newMat(n) {
      var mat = [];
      for (var i = 0 ; i < n ; i++) {
         mat.push([]);
         for (var j = 0 ; j < n ; j++)
	    mat[i].push(0);
      }
      return mat;
   }
*/
   this.size = size;
   this.mat = this._newMat();
   this.rot = this._newMat();
   this.tmp = this._newMat();
   this.err = this._newMat();
   this.identity();
}

Trackball.prototype = {

   identity : function() {
      this._identity(this.mat);
   },

   multiply : function(src) {
      this._multiply(src, this.mat, this.tmp);
      this._copy(this.tmp, this.mat);
   },

// Compute rotation that brings unit length A to nearby unit length B.

   rotate : function(A, B) {
      this._computeRotation(this.rot, A, B);
      this.multiply(this.rot);
   },

   transform : function(src, dst) {
      this._transform(this.mat, src, dst);
   },

   // INTERNAL METHODS

   _identity : function(mat) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
            mat[row][col] = row == col ? 1 : 0;
   },

   _computeRotation : function(rot, A, B) {

      // Start with matrix I + product ( 2*transpose(B-A) , A )

      this._identity(rot);
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
            rot[row][col] += 2 * (B[row] - A[row]) * A[col];

      // Iterate until matrix is numerically orthonormal:

      for (var totalError = 1.0 ; totalError >= 0.00001 ; ) {
     
         // Initialize each row error to 0:

         for (var i = 0 ; i < this.size ; i++)
            for (var k = 0 ; k < this.size ; k++)
                this.err[i][k] = 0;

         // Add to error between each pair of rows:

         for (var i = 0 ; i < this.size - 1 ; i++) {
            for (var j = i + 1 ; j < this.size ; j++) {
               var t = this._dot(rot[i], rot[j]);
               for (var k = 0 ; k < this.size ; k++) {
                  this.err[i][k] += rot[j][k] * t / 2;
                  this.err[j][k] += rot[i][k] * t / 2;
               }
            }
         }

         // For each row, subtract errors and normalize:

         totalError = 0;
         for (var i = 0 ; i < this.size ; i++) {
            for (var k = 0 ; k < this.size ; k++) {
               rot[i][k] -= this.err[i][k];
	       totalError += this.err[i][k] * this.err[i][k];
            }
            this._normalize(rot[i]);
         }
      }
   },

   _multiply : function(a, b, dst) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++) {
	    dst[row][col] = 0.0;
            for (var k = 0 ; k < this.size ; k++)
	       dst[row][col] += a[row][k] * b[k][col];
         }
   },

   _transform : function(mat, src, dst) {
      for (var row = 0 ; row < this.size ; row++) {
	 dst[row] = 0.0;
         for (var col = 0 ; col < this.size ; col++)
	    dst[row] += mat[row][col] * src[col];
      }
   },

   _copy : function(src, dst) {
      for (var row = 0 ; row < this.size ; row++)
         for (var col = 0 ; col < this.size ; col++)
	    dst[row][col] = src[row][col];
   },

   _dot : function(a, b) {
      var t = 0;
      for (var k = 0 ; k < this.size ; k++)
         t += a[k] * b[k];
      return t;
   },

   _newMat : function() {
      var mat = [];
      for (var i = 0 ; i < this.size ; i++) {
         mat.push([]);
         for (var j = 0 ; j < this.size ; j++)
	    mat[i].push(0);
      }
      return mat;
   },

   _normalize : function(a) {
      var s = Math.sqrt(this._dot(a, a));
      for (var k = 0 ; k < this.size ; k++)
         a[k] /= s;
   },
}

