function() {
   this.label = 'swing';
   var pd = [0,0];

   this.props = {
      length: [1,.001,1],
      dampen: [2,0,4],
   };

   this.onCmdClick = ['impel', () => pd[1] = 1];

   this.code = [
      ['', ['der -= pos * delta / length;',
            'pos += der * delta / length;',
            'pos *= 1  -  delta * dampen;'].join('\n')],
   ];

   this.render = elapsed => {
      let length = this.prop('length'),
          dampen = this.prop('dampen');

      let code = this.code[0][1] + '\nreturn [pos,der];';
      pd = (new Function('length','dampen','pos','der','delta',code))
                        (length, dampen, pd[0], pd[1], elapsed);

      this.afterSketch(function() {
         mDrawRect([-1,-1.4],[1,0.4]);
         let x = .05 * sqrt(dampen);
         mClosedCurve([[-x,-x],[x,x],[x,-x],[-x,x]]);
      });
      m.rotateZ(pd[0]);
      let y = -length;
      mLine([0,0],[0,y]);
      mDrawRect([-.1,y-.2],[.1,y]);
   }
}

