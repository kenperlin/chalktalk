function flying_saucer() {
   let isTesting = false;
   ctScene.add(this.obj = new CT.Node());
   this.obj.add(new CT.Sphere()).setColor(1,1,1)              // FUSILAGE
                                .scale(1,.4,1);
   this.obj.add(new CT.Sphere(24, 12, .5)).setColor(0,1,1)    // COCKPIT
                                          .rotateX(PI/2)
		                          .scale(.6,.6,.6);
   for (let n = 0 ; n < 6 ; n++)                              // LIGHTS
      this.obj.add(new CT.Sphere()).setColor(1,0,0)
                                   .rotateY(TAU * n / 6)
                                   .translate(.95,0,0)
                                   .scale(.06,.1,.1);
   timer.start('flying saucer', 3,
      () => {
	 let t = timer.elapsed('flying saucer') - 1.5;
         this.obj.placeOnScreen()                             // ANIMATE
	         .translate(isTesting ? min(0., t) : t, .35 - t * t / 4, 0)
	         .rotateX(.2)
	         .rotateY(2 * t)
	         .scale(.25);
      },
      () => isTesting ? null : ctScene.remove(this.obj));
}
