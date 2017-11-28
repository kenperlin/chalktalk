# Contribute

## What to Contribute:

Contributions to the sketch library and sketchlibs are welcome. 
Code that can be reused across multiple sketches should be placed in sketchlibs.
Suggest improvements or updates to the core codebase by submitting an issue.

Chalktalk is an educational platform and performance language capable of visually communicating knowledge in any subject, so new contributions should be made with that in mind.  

Current development for Chalktalk content will focus on building sketches that belong to certain domains of knowledge. (e.g. mathematics, architecture, audio engineering, sound design, VR, art, computer graphics, computer science, chemistry, cooking, etc.) Sketches should interact with each other as part of a larger ecosystem.
We encourage creativity and are excited to see contributions going beyond the current library.

## How to Contribute:

Formatting and Style:
- 3 space indents, terminate statements with semicolons,
  best to use braces for if/else/while/etc. for clarity 
    e.g.

      if (x) {
      } // else goes below this brace
      else {
      }
      
      // one-liner if-statement body, 
      // use braces even if unecessary
      // so future changes are less bug-prone
      // and easier to make
      if (y) {
         doSomething();
      }
    
- use `let` and `const` instead of `var` wherever possible, (not a restriction, just a loose recommendation)

- specify strict mode ( `"use strict"` ) at the top of all source files except for sketches. Note that sketches automatically use strict by default via the sketch loading code.

To create your own sketch, create a new .js file (nameOfMySketch.js) or copy a template (from sketch_templates) into the sketches directory. 

In your file, change the value of `this.label` and begin customizing your new sketch.

Note: a soon-to-be-enabled update will implement a sketch tagging system where each sketch is associated with one or more tags (attributes / descriptions), so new pull requests with sketches to be added should use `this.tag = "tagname"` or `this.tags = ["tagname1", "tagname2"]` within the function body of a sketch file (similar to `this.label` and `this.labels`). Tag names should be general enough to apply to multiple sketches.
