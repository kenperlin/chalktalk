function Crawler() {
   this.label = "crawler";
   var n = 20;

   var myFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * 30.;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + .5 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 12.) * P) / 12.);'
   ,'   vec3 color = ambient;'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( diffuse * mix(max(0.,D),max(0.,.5+.5*D),.5) +'
   ,'                           specular.rgb * pow(max(0., S), specular.a * n * n) );'
   ,'   }'
   ,'   gl_FragColor = vec4(sqrt(color), alpha);'
   ,'}'
   ].join("\n");

   this.getMaterial = function() {
      if (this._myMaterial === undefined) {
         var r = 1, g = .5, b = .25;
         this._myMaterial = this.shaderMaterial([r/200,g/200,b/200],
                                                [r/ 30,g/ 30,b/ 30],
                                                [r/  2,g/  2,b/  2, 2]);
      }
      return this._myMaterial;
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([-1,0], [1,0]);
         mLine([-.5,.5],[-.5,-.5]);
         mLine([  0,.5],[  0,-.5]);
         mLine([ .5,.5],[ .5,-.5]);
      });

      this.fragmentShader = myFragmentShader;

      this.afterSketch(function() {
         if (this.mesh.children.length == 0)
            for (var i = 0 ; i < n ; i++) {

               var body = new THREE.Mesh(globeGeometry(32,16), this.getMaterial());
               var leg1 = new THREE.Mesh(globeGeometry( 4, 2), this.getMaterial());
               var leg2 = new THREE.Mesh(globeGeometry( 4, 2), this.getMaterial());

	       var t = i / (n - 1);
	       var s = mix(.6, 3, sCurve(t));
               body.scale.set(mix(2,s*1.3,t)/n, s*1.3/n, s*.3/n);
               leg1.position.set(0, .03*s, 0);
               leg2.position.set(0,-.03*s, 0);
               leg1.rotation.set(0,0, .2);
               leg2.rotation.set(0,0,-.2);
               leg1.scale.set(.01*s, .1*s, .005*s);
               leg2.scale.set(.01*s, .1*s, .005*s);

               var segment = new THREE.Mesh();
               segment.add(body);
	       segment.add(leg1);
	       segment.add(leg2);

               this.mesh.add(segment);
            }
         for (var i = 0 ; i < n ; i++) {
	    var t = i / (n - 1);
	    var s = mix(.6, 3, sCurve(t));
	    var segment = this.mesh.children[i];
	    var theta = 10. * t + 10 * time;
            segment.position.set(2*t - 1, .03 * sin(theta), s*.3/n);
	    segment.rotation.z = .1 * cos(theta);
         }
      });
   }

   this.createMesh = function() {
      return new THREE.Mesh();
   }
}
Crawler.prototype = new Sketch;
addSketchType("Crawler");

