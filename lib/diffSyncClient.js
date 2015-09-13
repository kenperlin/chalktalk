   var socketio = window.io;
   var diffSyncClient;
   var data;

   function createBroadcast(name) {
      diffSyncClient = new diffsync.Client(socketio(), name);

      diffSyncClient.on("connected", function() {
         data = diffSyncClient.getData();

         if (isDef(data.sketchData))
            sketchPage.unpackSketches(JSON.parse(data.sketchData));

         setInterval(function() {
            var packed = sketchPage.serialize();
            data.sketchData = JSON.stringify(packed);
            diffSyncClient.sync();
            sketchPage._linksFromData(packed[1]);
         }, 100);
      });

      diffSyncClient.initialize();
   }

   function joinBroadcast(name) {
      diffSyncClient = new diffsync.Client(socketio(), name);

      diffSyncClient.on("connected", function() {
         data = diffSyncClient.getData();

         if (isDef(data.sketchData))
            sketchPage.unpackSketches(JSON.parse(data.sketchData));
      });

      diffSyncClient.on("synced", function() {
         sketchPage.sketches = [];
         sketchPage.unpackSketches(JSON.parse(data.sketchData));
      });

      diffSyncClient.initialize();
   }
