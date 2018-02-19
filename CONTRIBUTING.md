# Contribute

## What to Contribute

Contributions to the sketch library and sketchlibs are welcome. 
Code that can be reused across multiple sketches should be placed in sketchlibs.
Suggest improvements or updates to the core codebase by submitting an issue.

Chalktalk is an educational platform and performance language capable of visually communicating knowledge in any subject, so new contributions should be made with that in mind.  

Current development for Chalktalk content will focus on building sketches that belong to certain domains of knowledge. (e.g. mathematics, architecture, audio engineering, sound design, computer science, VR, AR, art, chemistry, cooking, etc.) Sketches should interact with each other as part of a larger ecosystem.
We encourage creativity and are excited to see contributions going beyond the current library.

## How to Contribute

Formatting and Style:
- 3 space indents, terminate statements with semicolons. Best to use braces for if/else/while/etc. for clarity.
    e.g.

      if (x) {
      } // else goes below this brace
      else {
      }
      
      // one-liner if-statement body, 
      // use braces even if unnecessary
      // so future changes are less bug-prone
      // and easier to make
      if (y) {
         doSomething();
      }
    
- Use `let` and `const` instead of `var` wherever possible. This isn't a restriction, just a loose recommendation.

- Specify strict mode ( `"use strict"` ) at the top of all source files except for sketches. Note that sketches automatically use strict by default via the sketch loading code.
