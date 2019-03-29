function() {
   this.label = 'testprops';

   var colorNames = 'white red green blue',
       colors     = colorNames.split(' ');

   this.props = {
      color : colorNames,
      width : 0.5,
   };

   this.onClick = ['toggle range', function() { 
/*
      if (this.prop('range'))
         this.setProp('range'); // DELETE
      else {
         this.setProp('range.low' , 0.3);
         this.setProp('range.high', 0.7);
         this.setProp('range.fill', false);
      }
*/
      this.setProp('range', this.prop('range') ? undefined : {low:0.3, high:0.7, fill:false});
      this.setProp('color', (this.prop('color') + 1) % colors.length);
   }];

   this.render = function() {
      color(colors[this.prop('color')]);
      let x = 2 * this.prop('width');
      mLine([x,1], [-x,1]);
      mLine([0,1], [0,-1]);
      if (this.prop('range')) {
         let xlo = this.prop('range.low')  * 2 - 1,
             xhi = this.prop('range.high') * 2 - 1;
         if (this.prop('range.fill'))
            mFillRect([xlo,-.25], [xhi,.25]);
         else
            mDrawRect([xlo,-.25], [xhi,.25]);
      }
/*
      let str = '';
      for (let key in this.props)
         str += key + ' ';
      console.log(str);
*/
   }
}
