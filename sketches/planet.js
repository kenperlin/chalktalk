function() {
   this.label = 'planet';
   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 32,PI/2,5*PI/2));
         mCurve([ [0,.95], [-1/2,1/3], [1/2,-1/3], [0,-.95] ]);
      });
   }

   this.fragmentShaders = [

   [
    '   void main(void) {'
   ,'      float x = vPosition.x;'
   ,'      float y = vPosition.y;'
   ,'      float dz = sqrt(1.-x*x-y*y);                      /* DEPTH  */'
   ,'      float s = .3*x + .3*y + .9*dz; s *= s; s *= s;    /* LIGHT  */'
   ,'      float cR = cos(.2*uTime), sR = sin(.2*uTime);     /* MOTION */'
   ,'      float cV = cos(.1*uTime), sV = sin(.1*uTime);'
   ,'      vec3 P = vec3(cR*x+sR*dz+cV,y,-sR*x+cR*dz+sV);'
   ,'      float g = turbulence(P);                          /* CLOUDS */'
   ,'      float d = 1. - 1.2 * (x*x + y*y);                 /* EDGE   */'
   ,'      d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : max(0.,d+.1);'
   ,'      float f = -.2 + sin(4. * P.x + 8. * g + 4.);      /* FIRE   */'
   ,'      f = f > 0. ? 1. : 1. - f * f * f;'
   ,'      f *= d > .1 ? 1. : (g + 5.) / 3.;'
   ,'      vec3 color = vec3(d*f*f*.85, d*f, d*.7);          /* COLOR  */'
   ,'      gl_FragColor = vec4(color,alpha*min(1.,10.*d));'
   ,'   }'
   ].join('\n'),

   [
   ,'   void main(void) {'
   ,'      float x = vPosition.x;'
   ,'      float y = vPosition.y;'
   ,'      float a = .7;'
   ,'      float b = .72;'
   ,'      float s = 0.;'
   ,'      float r0 = sqrt(x*x + y*y);'
   ,'      if (r0 > a && r0 <= 1.) {'
   ,'         float r = r0;'
   ,'         float ti = uTime*.3;'
   ,'         float t = mod(ti, 1.);'
   ,'         float u0 = turbulence(vec3(x*(2.-t)/2., y*(2.-t)/2., .1* t    +2.));'
   ,'         float u1 = turbulence(vec3(x*(2.-t)   , y*(2.-t)   , .1*(t-1.)+2.));'
   ,'         r = min(1., r - .1 + 0.3 * mix(u0, u1, t));'
   ,'         s = (1. - r) / (1. - b);'
   ,'      }'
   ,'      if (r0 < b)'
   ,'         s *= (r0 - a) / (b - a);'
   ,'      vec3 color = vec3(s);'
   ,'      float ss = s * s;'
   ,'      color = s*vec3(1.,ss,ss*ss);'
   ,'      gl_FragColor = vec4(color,alpha*s);'
   ,'   }'
   ].join('\n'),

   ];

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}


