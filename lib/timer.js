window.timer = new (function() {
   this.cancel = name => delete timers[name];

   this.elapsed = name => timers[name] ? time - timers[name].startTime : 0;

   this.isTimeout = name => {
      let timer = timers[name];
      return timer ? time - timer.startTime >= timer.duration : true;
   }

   this.start = (name, duration, during, after) =>
      timers[name] = {
         startTime : time,
         duration  : def(duration, Number.MAX_VALUE),
         during    : during,
         after     : after,
      };

   this.stop = name => {
      if (timers[name].after)
	 timers[name].after();
      delete timers[name];
   }

   setInterval(() => {
      time = Date.now() / 1000;
      for (name in timers) {
         let timer = timers[name];
         if (timer) {
	    if (timer.during)
	       timer.during();
	    if (this.isTimeout(name))
	       this.stop(name);
	 }
      }
   }, 15);

   let time = 0, timers = {};
})();

