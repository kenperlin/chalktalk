function() {
   this.label = 'planet';
   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 16,  PI/2,3*PI/2));
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 16,3*PI/2,5*PI/2));
      });
   }

   this.fragmentShaders = [

   [
   ,'void main(void) {'
   ,'   float x = vPosition.x;'
   ,'   float y = vPosition.y;'
   ,'   float dz = sqrt(1.-x*x-y*y);                      /* DEPTH  */'
   ,'   float s = .3*x + .3*y + .9*dz; s *= s; s *= s;    /* LIGHT  */'
   ,'   float cR = cos(.2*uTime), sR = sin(.2*uTime);     /* MOTION */'
   ,'   float cV = cos(.1*uTime), sV = sin(.1*uTime);'
   ,'   vec3 P = vec3(cR*x+sR*dz+cV,y,-sR*x+cR*dz+sV);'
   ,'   float g = turbulence(P);                          /* CLOUDS */'
   ,'   float d = 1. - 1.2 * (x*x + y*y);                 /* EDGE   */'
   ,'   d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : max(0.,d+.1);'
   ,'   float f = -.2 + sin(4. * P.x + 8. * g + 4.);      /* FIRE   */'
   ,'   f = f > 0. ? 1. : 1. - f * f * f;'
   ,'   f *= d > .1 ? 1. : (g + 5.) / 3.;'
   ,'   vec3 color = vec3(d*f*f*.85, d*f, d*.7);          /* COLOR  */'
   ,'   gl_FragColor = vec4(color,alpha*min(1.,10.*d));'
   ,'}'
   ].join('\n'),

   [
   ,'void main(void) {'
   ,'   float x = vPosition.x;'
   ,'   float y = vPosition.y;'
   ,'   float a = .7;'
   ,'   float b = .72;'
   ,'   float s = 0.;'
   ,'   float r0 = sqrt(x*x + y*y);'
   ,'   if (r0 > a && r0 <= 1.) {'
   ,'      float r = r0;'
   ,'      float ti = uTime*.3;'
   ,'      float t = mod(ti, 1.);'
   ,'      float u0 = turbulence(vec3(x*(2.-t)/2., y*(2.-t)/2., .2* t    +2.));'
   ,'      float u1 = turbulence(vec3(x*(2.-t)   , y*(2.-t)   , .2*(t-1.)+2.));'
   ,'      r = min(1., r - .1 + 0.3 * mix(u0, u1, t));'
   ,'      s = (1. - r) / (1. - b);'
   ,'   }'
   ,'   if (r0 < b)'
   ,'      s *= (r0 - a) / (b - a);'
   ,'   vec3 color = vec3(s);'
   ,'   float ss = s * s;'
   ,'   color = s*vec3(1.,ss,ss*ss);'
   ,'   gl_FragColor = vec4(color,alpha*s);'
   ,'}'
   ].join('\n'),

   [
   ,'float turb(vec3 P) {'
   ,'   float f = 0., s = 1.;'
   ,'   for (int i = 0 ; i < 7 ; i++) {'
   ,'      f += abs(noise(s * P)) / s;'
   ,'      s *= 2.;'
   ,'      P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);'
   ,'   }'
   ,'   return f;'
   ,'}'
   ,'void main(void) {'
   ,'   gl_FragColor = vec4(1., 1., 1., 1.) * turb(vPosition);'
   ,'}'
   ].join('\n'),

   phongShader.concat(M_turbulence.concat(
   [
   ,'// TEST MODULAR TURBULENCE.'
   ,'void main(void) {'
   ,'   vec3 P = vPosition;'
   ,'   float cx = cos(.15 * uTime), sx = sin(.15 * uTime);    // ROTATE ABOUT X'
   ,'   float cy = cos(.1  * uTime), sy = sin(.1  * uTime);    // ROTATE ABOUT Y'
   ,'   P = vec3(P.x                , P.y * cx + P.z * sx, P.y * sx - P.z * cx);'
   ,'   P = vec3(P.x * cy + P.z * sy, P.y                , P.x * sy - P.z * cy);'
   ,'   vec3 color = phongShader(normalize(vNormal));'
   ,'   gl_FragColor = vec4(color, 1.) * M_turbulence(vec3(.5, .5, .5) + .5 * P);'
   ,'}'
   ,''
   ].join('\n'))),

   N_fractal.concat(
   [
   ,'void main(void) {'
   ,'   vec4 f = N_fractal(.5 + .5 * vPosition);'
   ,'   vec4 a = abs(f);'
   ,'   float s = a.x + a.y + a.z + a.w;'
   ,'   gl_FragColor = vec4(pow(vec3(s,s,s), vec3(.45,.45,.45)), 1.);'
   ,'}'
   ].join('\n')),

   ]

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}

