function() {
   this.label = 'fish';
   this.swim = false;
   this.onSwipe[0] = ['SWIM!', function() { this.swim = true; }];
   this.angleY = 0;
   this.angleZ = 0;

   this.m0 = new M4();

   this.render = function() {
      var c = 0;
      this.afterSketch(function() {
         var angle, p0, p1, dx, dy, dz;;

         if (this.swim) {
            if (this.swimTime === undefined)
               this.swimTime = time;
            var t = time - this.swimTime;
            c = cos(2 * TAU * t) * .1;
            if (typeof this.inValue[0] != 'function')
               m.translate(2*t,0,0);
            else {
               p0 = this.inValue[0]( t/4         % 1);
               p1 = this.inValue[0]((t/4 + .001) % 1);

               dx = p1[0] - p0[0];
               dy = p1[1] - p0[1];
               dz = p1[2] - p0[2];

               angle = atan2(-dx, dy);
               while (angle - this.angleZ >  PI) angle -= TAU;
               while (angle - this.angleZ < -PI) angle += TAU;
               this.angleZ = mix(this.angleZ, angle, .1);

               angle = atan2(-sqrt(dx * dx + dy * dy), dz);
               while (angle - this.angleY >  PI) angle -= TAU;
               while (angle - this.angleY < -PI) angle += TAU;
               this.angleY = mix(this.angleY, angle, .1);

               m.translate(2 * p0[0], 2 * p0[1], 2 * p0[2]);
               m.rotateZ(  PI/2 + this.angleZ );
               m.rotateY(-(PI/2 + this.angleY));
            }
            m.translate(1,0,0);
            m.rotateZ(-c/2);
            m.translate(-1,0,0);
         }
      });

      var h = this.stretch('round', 2.5 * S(0).height / S(0).width);

      mSpline([[-1  ,h* .3  + c  ],
               [-.45,       - c/2],
               [ .13,h*-.28      ],
               [ .61,h*-.31      ],
               [ .92,h*-.18      ],
               [ 1  ,     0      ],
               [ .92,h* .18      ],
               [ .61,h* .31      ],
               [ .13,h* .28      ],
               [-.45,       - c/2],
               [-1  ,h*-.3  + c  ]]);

      mSpline([[-1  , h* .3 + c  ],
               [-.95,         c  ],
	       [-1  , h*-.3 + c  ]]);

      this.afterSketch(function() {
         mSpline([[.95,h*-.15],[.8,h*-.15],[.6,h*-.15+.05]]);
         mDrawOval([.55 - h*.1, .05 + h*.02], [.55 + h*.1, .05 + h*.22]);
         if (! this.isOnScreen())
            this.fade();
      });
   }
}
