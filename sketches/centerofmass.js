function() {
  this.label = "centermass";

  this.onClick = function() {};

  this.mouseDown = function(x, y) {}
  this.mouseDrag = function() {}
  this.mouseUp = function() {}


  this.render = function() {
     this.duringSketch(function() {
        mDrawOval([-0.8, -0.8], [1.6, 1.6]);
        mDrawOval([-0.2, -0.2], [0.4, 0.4]);
     });

     this.afterSketch(function() {
         // main rectangle
         mDrawRect([-1, -1], [1, 1]);

         // draw coordinate grid
         mLine([0, -1], [0, 1]);
         mLine([-1, 0], [1, 0]);

         if (this.inValue_DEPRECATED_PORT_SYSTEM[0]) {
           var center = this.getCenterOfMass(this.inValue_DEPRECATED_PORT_SYSTEM[0]);

           // draw center of mass

           var x = center.x/(this.inValue_DEPRECATED_PORT_SYSTEM[0].width/2)-1;
           var y = center.y/(this.inValue_DEPRECATED_PORT_SYSTEM[0].height/2)-1;
           color(255, 100, 100);
           mFillRect([x-0.03, y-0.03], [x+0.03, y+0.03]);

           // send center of mass
           this.outValue[0] = [center.x, center.y];
         }

       });
    };

    this.getCenterOfMass = function(frame)
    {
      var totalWeight = 0;
      var totalPos = {'x':0, 'y':0};

      for (var y=0; y<frame.height; y++) {
        for (var x=0; x<frame.width; x++) {

          var weight = frame.data[x + frame.width*y];
          totalPos.x += weight*x;
          totalPos.y += weight*y;
          totalWeight += weight;
        }
      }

      if (totalWeight == 0) {
        return totalPos;
      }

      totalPos.x /= totalWeight;
      totalPos.y /= totalWeight;

      return totalPos;
    }
}
