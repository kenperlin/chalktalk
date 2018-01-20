function() {
   this.label = 'testprops';
   this.render = function() {
      mLine([1,1],[-1,1]);
      mLine([0,1],[0,-1]);
   }

   this.props = {
      foo : 0.5,
      bar : 'a b c d',
   };

   this.onClick = ['click', function() { 
      this.setProp('range.low' , 0.3);
      this.setProp('range.high', 0.7);
   }];
}
