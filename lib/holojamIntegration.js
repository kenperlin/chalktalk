
function connectToHolojamServer() {
   holojamSocket = io('https://holojam.herokuapp.com/client');

   holojamSocket.on('update', function (data) {
      console.log(data);
      var live_objects = data.live_objects;
         for (var i = 0 ; i < live_objects.length ; i++) {
            var obj = live_objects[i];
            //console.log("obj label:" + obj.label + "\tpos:(" + obj.x+"," + obj.y + "," + obj.z + ")" + "\trotation:(" + obj.qx + "," + obj.qy + "," + obj.qz + "," + obj.qw + ")")
            if (obj.label == 'VR1') {
               // zhenyi, turn p,q to viewmatrix
               pq = [obj.x,obj.y,obj.z,obj.qx,obj.qy,obj.qz,obj.qw];
               console.log("pq: before\t" + pq);
               lhs2rhs(pq)
               console.log("pq: after\t" + pq);
               window.matrixHelper.setPQ(pq);
            }
            if (obj.label == 'VR2') {
               pq2 = [obj.x,obj.y,obj.z,obj.qx,obj.qy,obj.qz,obj.qw];
               lhs2rhs(pq2)
               window.cubeHelper.setPQ(pq2);
               
            }
         }
   });
}
