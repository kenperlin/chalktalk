
function connectToHolojamServer() {
   holojamSocket = io('https://holojam.herokuapp.com/client');

   holojamSocket.on('update', function (data) {
      console.log(data);
      /*var live_objects = data.live_objects;
      for (var i = 0 ; i < live_objects.length ; i++) {
         var obj = live_objects[i];
         if (obj.label == 'perlin imu') {
            qx = obj.qx;
            qy = obj.qy;
            qz = obj.qz;
            qw = obj.qw;
         }
      }*/
   });
}
