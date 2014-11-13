function Tactonic() {
   this.labels = "tactonic".split(' ');

   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,1],[1,1]);
         mLine([0,1],[0,-1]);
      });

      this.afterSketch(function() {
         mClosedCurve([ [-1.1,-1.1], [1.1,-1.1], [1.1,1.1], [-1.1,1.1] ]);
      });
   }

   this.fragmentShader = [
    'void main(void) {'
   ,'   float c = ( (dx-mx < 0.) == (dy-my < 0.) ) == (mz == 1.) ? .5 : 1.;'
   ,'   gl_FragColor = vec4(pow(c,.45), pow(c,.45), pow(c,.45), alpha);'
   ,'}'
   ].join("\n");

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}
Tactonic.prototype = new Sketch;
addSketchType("Tactonic");


