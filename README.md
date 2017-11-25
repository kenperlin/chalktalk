# Chalktalk

![](readme_images/Pendulum.gif)

**Chalktalk** is a digital presentation and communication language 
in development at [New York University's Future Reality Lab](https://frl.nyu.edu/).
Using a blackboard-like interface, it allows a presenter to create and interact
with animated digital sketches in order to demonstrate ideas and concepts in the context
of a live presentation or conversation.

Sketches can display animations and graphics in 2D and 3D…

![](readme_images/Rotation.gif)

…link together to demonstrate complex logical connections and behaviors…

![](readme_images/3DGraphics.gif)

…and even be coded live from within Chalktalk itself.

![](readme_images/LiveCoding.gif)

A growing library of sketches--from creatures to math and physics objects--is available,
and Chalktalk continues to evolve.

## This branch

This is an experimental branch for Chalktalk aimed at overhauling Chalktalk's connection/link system, by requiring sketches to declare what type of data they're outputting and what type of data they're expecting as input.

A type system called Atypical is used as a way to support this. This type system is implemented wholly in Javascript, and is focused on making it easy to define data conversions between types, so as to maximize interoperability between sketches (within reasonable limits). You can see the type system implementation in the top-level `types` directory.

## Installation and Usage

Installation instructions can be found [in the wiki](https://github.com/kenperlin/chalktalk/wiki/Installation-and-Running). A brief tutorial on how to use the system [can be found there as well](https://github.com/kenperlin/chalktalk/wiki/Introduction-to-Chalktalk).

## Creating and Contributing

Contributions to the core codebase and sketch library are welcome.

To create your own sketch, create a new .js file (nameOfMySketch.js) or copy a template (from sketch_templates) into the sketches directory. 

In your file, change the value of `this.label` and begin customizing your new sketch.

[Further information on sketch creation can be found in the wiki](https://github.com/kenperlin/chalktalk/wiki/Creating-a-Sketch).

## License 
MIT


