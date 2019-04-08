function Sequence(args) {
   let actions = args, ns = actions.length / 2, state = ns, prevState = ns,
       time = 0, timers = {}, D = name => def(name, 'default');

   // BASIC SEQUENCING

   this.start       = () => state = 0;
   this.stop        = () => state = ns;
   this.isCompleted = () => state == ns;

   // TIMERS

   this.startTimer = (name, duration, during, after) =>
      timers[D(name)] = {
         startTime : time,
         duration  : def(duration, Number.MAX_VALUE),
         during    : during,
         after     : after,
      };
   this.stopTimer  = name => {
      name = D(name);
      if (timers[name].after)
	 timers[name].after();
      delete timers[name];
   }
   this.isTimeout = name => {
      let timer = timers[D(name)];
      if (! timer)
         return true;
      return time - timer.startTime >= timer.duration;
   }
   this.elapsed = name => timers[D(name)] ? time - timers[D(name)].startTime : 0;

   // PERIODIC UPDATE, TO BE CALLED ONCE PER ANIMATION FRAME

   this.update = _time => {
      time = _time;
      for (name in timers) {
         let timer = timers[name];
         if (timer) {
	    if (timer.during)
	       timer.during();
	    if (this.isTimeout(name))
	       this.stopTimer(name);
	 }
      }
      if (state < ns)
         if (state != prevState) {
	    if (actions[2 * state])
               actions[2 * state]();
            prevState = state;
         }
         else if (! actions[2 * state + 1] || actions[2 * state + 1]()) {
            state = (state + 1) % (ns + 1);
	    prevState = ns;
         }
   }
}

