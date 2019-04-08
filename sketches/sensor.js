function() {
   this.label = 'sensor';
   this.is3D = true;
   let fl = 20;
   let y1 = -16.5/12, y2 = y1 + 33/12, y3 = y2 + 7.5/12;
   let x1 = 2, x2 = x1 * (fl - y2) / (fl - y1), x3 = x1 * (fl - y3) / (fl - y1);
   this.render = () => {
      color('rgb(30,30,30)');
      mFillCurve([[-x3,y3],[-x1,y1],[x1,y1],[x3,y3]]);
      color('rgb(10,10,10)');
      mFillCurve([[-x3,y3],[-x2,y2],[x2,y2],[x3,y3]]);
   }
}
