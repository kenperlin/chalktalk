   var socket = window.io;
   var diffSyncClient = new diffsync.Client(socket(), 1);

   var data;

   diffSyncClient.on("connected", function() {
      console.log("connected");
      data = diffSyncClient.getData();

      if (isDef(data.sketchData))
         sketchPage.unpackSketches(JSON.parse(data.sketchData));
   });

   diffSyncClient.on("synced", function() {
      console.log("synced at " + new Date().getTime());
      sketchPage.sketches = [];
      sketchPage.unpackSketches(JSON.parse(data.sketchData));
   });

   function startSync() {
      diffSyncClient.initialize();
      setInterval(function() {
         var packed = sketchPage.serialize();
         data.sketchData = JSON.stringify(packed);
         diffSyncClient.sync();
      }, 1000);
   }

   function testSync() {
      console.log("making change at " + new Date().getTime());
      var packed = sketchPage.serialize();
      data.sketchData = JSON.stringify(packed);
      diffSyncClient.sync();
      sketchPage._linksFromData(packed[1]);
   }
