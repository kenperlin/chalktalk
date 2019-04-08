function() {
  this.label = 'grid';

  var ns = 12;

  this.render = function() {
     mLine([-1,1],[1,1]);
     mLine([-1,1],[-1,-1]);
     this.afterSketch(function() {
        for (let nv = 0 ; nv <= ns ; nv++) {
	   let v = nv/ns;
	   mLine([-1,2*v-1],[1,2*v-1]);
        }
        for (let nu = 0 ; nu <= 2*ns ; nu++) {
	   let u = nu/(2*ns);
	   mLine([2*u-1,-1],[2*u-1,1]);
	}
     });
  }


}
