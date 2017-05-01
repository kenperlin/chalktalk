function() {
   this.label = 'controller';
   this.cIndex = 0;
   this.render = function() {

      // READ CONTROLLER DATA FOR THIS FRAME

      if (! this.cData)
         this.cData = JSON.parse(controllerData);
      let data = this.cData[this.cIndex];
      this.cIndex = (this.cIndex + 1) % this.cData.length;

      // CREATE MATRIX REPRESENTING CONTROLLER POSITION + ORIENTATION

      let px = data.pos.x, py = data.pos.y, pz = data.pos.z;
      let qx = data.rot.x, qy = data.rot.y, qz = data.rot.z;
      let qw = sqrt(1 - qx * qx - qy * qy - qz * qz);
      let pqm = CT.matrixFromPQ([8*px, 8*py, 8*pz, qx, qy, qz, qw]);

      // GET BUTTON DATA FROM CONTROLLER

      let trigger = (data.button & 128) != 0;
      let touch   = (data.button &  64) != 0;
      let press   = (data.button &  32) != 0;

      // RENDER THE CONTROLLER

      lineWidth(trigger ? 4 : 1);
      m._xf(pqm);
      mLine([-.2,.5],[-.2,-1.5]);
      mLine([-.2,.5],[ .2,  .5]);
      mLine([ .2,.5],[ .2,-1.5]);
      this.afterSketch(function() {
         lineWidth(press ? 9 : touch ? 3 : 1);
         mDrawDisk([0,-.2], .15);
      });
   }
}
