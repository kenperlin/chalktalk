function() {
   this.label = "pendulum";


   var on = {
     eventType: "hue",
     brightness: 50,
     hue: 30000
   };

   var off = {
     eventType: "hue",
     brightness: 0,
     hue: 30000
   };
     this.onSwipe[2] = ['turn\non' , function() {  server.broadcastObject(off); }];

   var xx, yy, spring = new Spring(), force = 0, adjustHeight = 1,
       angle = 0, bobRadius, hubWidth, rodHeight, swingMode = 'swing';

   this.mouseDown = function(x, y) {
      xx = x;
      yy = y;
   }

   this.onCmdClick = function() {
      swingMode = swingMode == 'swing' ? 'height' : 'swing';
   }

   this.mouseDrag = function(x, y) {


      var dx = x - xx;
      var dy = y - yy;
      switch (swingMode) {
      case 'swing':
         force = 10 * dx / height();
         break;
      case 'height':
         adjustHeight *= 1 + dy / height() / rodHeight;
         break;
      }
      xx = x;
      yy = y;
      console.log("x difference " + dx + " y difference " + dy)
      var msg = {
        eventType: "hue",
        brightness : 100,
        dx: dx, // todo: scale dx to a max of 255, ignore 0 and when negative, take away from brightness
        force: force
      };

      server.broadcastObject(msg);
   }
   //var hueState = false;

   this.render = function(elapsed) {

      hubWidth  = this.stretch('hub width' , 10 * S(0).width);
      rodHeight = this.stretch('rod length', 10 * (S(2).y - S(1).ylo) / 4) * 4;
      bobRadius = this.stretch('bob size'  , 10 * (S(2).width + S(2).height) / 4);

      rodHeight *= adjustHeight;

      spring.setMass(rodHeight * bobRadius);
      spring.setForce(force);
      force *= 0.9;
      spring.update(elapsed);

      var N = 32;
      m.scale(.5 * this.size / 40);
      m.translate(0, 2 - rodHeight, 0);
      mCurve([[-.5 * hubWidth, rodHeight], [.5 * hubWidth, rodHeight]]);

      angle = def(this.inValues[0], spring.getPosition());
      if (isNaN(angle)) angle = 0;

      m.translate(0, rodHeight, 0);
      m.rotateZ(angle);
      m.translate(0, -rodHeight, 0);

      mCurve([[0, rodHeight], [0,bobRadius]]);
      mDrawOval([-bobRadius, -bobRadius], [bobRadius, bobRadius], N, PI/2, PI/2-TAU);

    /*
     if (hueState == true) {
       server.broadcastObject(off);
       hueState = false;
     }
     else if (hueState ==false){
       server.broadcastObject(on);
       console.log("on");
       hueState = true;
     }*/


   }

   this.output = function() { return angle; }
}
