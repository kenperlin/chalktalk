function() {
   this.label = 'm3xv3';
   this.render = function() {
      this.duringSketch(function() {
         mClosedCurve([[-1,1],[1.5,1],[1.5,-1],[-1,-1]]);
         mLine([1,1],[1,-1]);
      });
      this.afterSketch(function() {
         var s = this.mScale(1);
         mClosedCurve([[-1,1],[.9,1],[.9,-1],[-1,-1]]);
         mClosedCurve([[1.1,1],[1.5,1],[1.5,-1],[1.1,-1]]);
         textHeight(.4 * s);
         mText('u', [1.3, .65], .5, .5);
         mText('v', [1.3, .05], .5, .5);
         mText('1', [1.3,-.65], .5, .5);
         lineWidth(1);
         var x0 = mix(-1,.9,1/3);
         var x1 = mix(-1,.9,2/3);
         var y0 = mix(-1,1,1/3);
         var y1 = mix(-1,1,2/3);
         mLine([-1,y0],[.9,y0]);
         mLine([-1,y1],[.9,y1]);
         mLine([x0,-1],[x0,1]);
         mLine([x1,-1],[x1,1]);
         for (var i = 0 ; i < 3 ; i++)
         for (var j = 0 ; j < 3 ; j++) {
            var x = mix(-1, .9, (i + .5)/3);
            var y = mix(.9, -1, (j + .5)/3);
            textHeight(.2 * s);
            mText('m  ', [x,y], .6, 1);
            textHeight(.1 * s);
            mText('  '+i+','+j, [x,y], .1, .5);
         }
      });
   }
}
