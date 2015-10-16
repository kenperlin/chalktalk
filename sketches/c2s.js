function() {
   this.label = "c2s";

   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-1,-1,2,2,20,-PI/2,3*PI/2));
      });
      this.useInputColors();
   }

   this.fragmentShaders = [

   defaultFragmentShader,

   phongShader.concat(M_turbulence.concat(
   [
   ,'void main(void) {'
   ,'   M_frequency = 4.4;'
   ,'   float texture = M_turbulence(vec3(.5, .5, .5 + .04 * uTime) + .5 * vPosition);'
   ,'   vec3 color = phongShader(normalize(vNormal));'
   ,'   color = mix(.2,1.,texture) * color + vec3(1.,1.,1.)*pow(1.1*texture,4.);'
   ,'   gl_FragColor = vec4(pow(color,vec3(.45,.45,.45)), 1.);'
   ,'}'
   ,''
   ].join('\n'))),

   phongShader.concat(M_turbulence.concat(
   [
   ,'void main(void) {'
   ,'   M_frequency = 4.0;'
   ,'   vec3 P = vec3(.5, .5, .5 + .04 * uTime) + .5 * vPosition;'
   ,'   vec3 f = M_turb6(P);'
   ,'   float ground = 1. - 6. * f.x * f.x;'
   ,'   float clouds = 1.5 * f.x + f.y + f.z;'
   ,'   vec3 color = phongShader(normalize(vNormal));'
   ,'   color = mix(.5 * color.bgr, color, pow(ground,2.)) + vec3(1.,1.,1.) * pow(clouds, 3.);'
   ,'   gl_FragColor = vec4(pow(color,vec3(.45,.45,.45)), 1.);'
   ,'}'
   ,''
   ].join('\n'))),

   ];

   this.createMesh = function() {
      return new THREE.Mesh(globeGeometry(80,40), this.shaderMaterial());
   }
}
