
**Chalktalk** is a graphic blackboard to teach sciences, computer sciences and more. 
A list of +250 objects ("glyphs") with specific behaviors is available. Glyphs can be connected and affect each others via an input/output maner, so meaningful mecanisms can be build. Glyphs can also be reprogrammed, stylized.

## This branch

This is an experimental branch for Chalktalk aimed at overhauling Chalktalk's connection/link system, by requiring sketches to declare what type of data they're outputting and what type of data they're expecting as input.

A type system called Atypical is currently being developed as a way to support this. This type system is implemented wholly in Javascript, and is focused on making it easy to define data conversions between types, so as to maximize interoperability between sketches (within reasonable limits). You can see the current implementation in the top-level `types` directory.

### Installation
See wiki.

### Usage
See wiki.

### Hacking
To try creating your own sketch type, copy any of the files in
the sketches/ folder to a new sketches/WHATEVER.js file.

In your new file, change the value of this.label, and customize
it to draw a different shape.

### License
(to come)


