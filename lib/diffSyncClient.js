   var socketio = window.io;
   var diffSyncClient;
   var data;

   function createBroadcast(name) {
      diffSyncClient = new diffsync.Client(socketio(), name);

      diffSyncClient.on("connected", function() {
         data = diffSyncClient.getData();

         if (isDef(data.sketchData))
            sketchPage.unpackSketches(data.sketchData);

         setInterval(function() {
            var packed = sketchPage.serialize();
            data.sketchData = packed;
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
            sketchPage.unpackSketches(data.sketchData);
      });

      diffSyncClient.on("synced", function() {
         sketchPage.sketches = [];
         sketchPage.unpackSketches(data.sketchData);
      });

      diffSyncClient.initialize();
   }
