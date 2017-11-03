function() {
   this.label = "frl";
   this.is3D = true;
   //this.frl = new FRL();

   // this.onSwipe[0] = ['walk'        , function() { this.bird.turnOnWalk(); }];
   // this.onSwipe[1] = ['toggle\ngaze', function() { this.bird.toggleGaze(); }];
   // this.onSwipe[2] = ['toggle\ngaze', function() { this.bird.toggleGaze(); }];
   // this.onSwipe[4] = ['come\nalive' , function() { this.bird.turnOnIdle(); }];

   this.render = function(elapsed) {
      var light = this.getInValue(0, this.light);

      var fsketch = [
         [0,-2,0], [0,0,0], [1,0,0]
      ];

      var rsketch = [
         [0,0,0], [1,-0.5,0], [0,-1,0]
      ];

      var lsketch = [
         [0,0,0], [0,-2,0], [1,-2,0]
      ];

      this.duringSketch(function() {
         lineWidth(1);

         mCurve(fsketch);

         var c = makeSpline(rsketch);
         // var c = arc(0, -0.5, 0.5, PI/2, 3 * PI / 2);
         c.push([1,-2,0]);
         mCurve(c);

         mCurve(lsketch);


      });

      m.scale(3.0);

      var x = 0;
      m.save();
         m.translate(x, 0, 0);
         m.scale(0.73825, 0.245625, 0.0001); // FLOOR
         mSquare().texture('images/frl/FloorTile.jpg');
      m.restore();
      x = -.73825 + .024;
      m.save();
         m.translate(x, .245625 + .029, .143); // COLUMN
         m.scale(0.024, 0.029, .143);
         mCube().color(157/255,41/255,51/255);
      m.restore();
      x += .024 + 2*.2125 + .026625;
      m.save();
         m.translate(x, .245625 + .029, .143); // COLUMN
         m.scale(0.026625, 0.029, 0.143);
         mCube().color(157/255,41/255,51/255);
      m.restore();
      x += .026625 + 2 * .212 + .026625;
      m.save();
         m.translate(x, .245625 + .029, .143); // COLUMN
         m.scale(0.026625, 0.029, 0.143);
         mCube().color(157/255,41/255,51/255);
      m.restore();
      x += .026625 + 2 * .2365 - .026625;
      m.save();
         m.translate(x, .245625 + .029, .143); // COLUMN
         m.scale(0.026625, 0.029, 0.143);
         mCube().color(157/255,41/255,51/255);
      m.restore();
      // x = -.73825 + .0185;
      // m.save();
      //    m.translate(x, 0, .029); // CABINETS
      //    m.scale(0.0185, 0.245625, 0.029);
      //    mCube();
      // m.restore();
      // m.save();
      //    m.translate(0, .245626 + .022, 2 * .029 + 2 * .0665 + .0475); // CABINETS
      //    m.scale(.73825, .022, 0.0475);
      //    mCube();
      // m.restore();
      x = -.73825;
      m.save();
         m.translate(x, 0, .143);
         m.rotateY(PI/2);
         m.rotateZ(PI/2);
         m.scale(0.245625, 0.143, 1); // WEST WALL
         
         // mSquare().texture('images/frl/leftWall_transparent.png').setOpacity(0.5);
         mSquare().texture('images/frl/leftWall_transparent.png').setOpacity(0.5);
      m.restore();



      x = .73825;
      m.save();
         m.translate(x, 0, .143);
         m.rotateY(PI/2);
         m.rotateZ(PI/2);
         m.scale(0.245625, 0.143, 1); // EAST WALL
         mSquare().texture('images/frl/rightWall_transparent.png').setOpacity(0.75);
      m.restore();
      m.save();
         m.translate(0, -.24526, .143);
         m.rotateX(PI/2);
         m.scale(.73825/3, 0.143, 1); // SOUTH WALL
         mSquare().texture('images/frl/frontWall_transparent.png').setOpacity(0.75);
      m.restore();
      m.save();
         m.translate(-.73825/3*2, -.24526, .143);
         m.rotateX(PI/2);
         m.scale(.73825/3, 0.143, 1); // SOUTH WALL
         mSquare().texture('images/frl/frontWall_transparent.png').setOpacity(0.75);
      m.restore();
      m.save();
         m.translate(.73825/3*2, -.24526, .143);
         m.rotateX(PI/2);
         m.scale(.73825/3, 0.143, 1); // SOUTH WALL
         mSquare().texture('images/frl/frontWall_transparent.png').setOpacity(0.75);
      m.restore();
   

      // this.afterSketch(function() {
      //    m.save();
      //    m.scale(0.5,0.5,0.5);
      //    m.rotateY(PI/4);
      //    m.translate(0.5,0,0);
      //    var mdl = mSquare().texture('images/brick.png');
      //    // var mdl = mSquare().setTexture('http://localhost:11235/images/brick.png');
      //    // this._model.getChild(0).setTexture('images/brick.png');
      //    m.restore();

      //    m.save();
      //    m.rotateY(-PI/4);
      //    m.scale(0.5,0.5,0.5);
      //    m.translate(-0.5,0,0);
      //    mSquare();
      //    m.restore();
      // });

      
   }
}
