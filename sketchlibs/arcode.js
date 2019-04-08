function ARcode(value, n) {
   var image = [];
   console.log(value);
   for (let j = 0 ; j < n ; j++) {
      image.push([]);
      for (let i = 0 ; i < n ; i++)
         image[j].push(i==0 || i==n-1 || j==0 || j==n-1 || value & 1 << (n-2)*(j-1) + (i-1) ? 1 : 0);
   }
   return image;
}

