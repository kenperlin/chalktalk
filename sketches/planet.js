function() {
   this.label = 'planet';
   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 32,PI/2,5*PI/2));
         mCurve([ [0,.95], [-1/2,1/3], [1/2,-1/3], [0,-.95] ]);
      });
   }

   this.fragmentShader = [
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
   ].join('\n');

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}


