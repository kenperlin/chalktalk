"use strict";

function fft(real, imag) {
   var n = real.length, i, j, k, log2_n, size, cos = [], sin = [];

   if (n == 1)
      return;

   for (i = 0 ; i < n / 2 ; i++) {
      cos.push(Math.cos(2 * Math.PI * i / n));
      sin.push(Math.sin(2 * Math.PI * i / n));
   }
   
   for (log2_n = 1 ; (1 << log2_n) < n ; log2_n++)
      ;
   
   for (i = 0 ; i < n ; i++)
      if ((j = reverseBits(i, log2_n)) > 1) {
         let tmp = real[i];
         real[i] = real[j];
         real[j] = tmp;
         tmp     = imag[i];
         imag[i] = imag[j];
         imag[j] = tmp;
      }
   
   for (size = 2 ; size <= n ; size <<= 1) {
      let halfsize = size >> 1;
      let step = n / size;
      for (i = 0 ; i < n ; i += size)
      for (j = i, k = 0 ; j < i + halfsize ; j++, k += step) {
         let tpreal =  real[j + halfsize] * cos[k] + imag[j + halfsize] * sin[k];
         let tpimag = -real[j + halfsize] * sin[k] + imag[j + halfsize] * cos[k];
         real[j + halfsize] = real[j] - tpreal;
         imag[j + halfsize] = imag[j] - tpimag;
         real[j] += tpreal;
         imag[j] += tpimag;
      }
   }
   
   function reverseBits(x, bits) {
      var y = 0;
      for (let i = 0 ; i < bits ; i++) {
         y = (y << 1) | (x & 1);
         x >>>= 1;
      }
      return y;
   }
}

