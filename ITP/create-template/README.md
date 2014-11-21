This web project has the following setup:

* build/ - contains output files generated with grunt chalktalk.js and chalktalk.min.js

* deps/ - the directory to hold third party scripts.

* html/ - example and test index.html files. One loads with require.js, and another loads without require.

* src/ - our source files for the project
    * app.js - the top-level config script, used by require.js

* gruntfile.js - defines grunt routines
    * first, from the command line, type ```npm install```. This generated a node_modules folder that includes all the grunt modules.
    * If you have not already installed the Grunt Command Line Interface (i.e. ```which grunt``` does not give a path to grunt), then install it with ```npm install -g grunt-cli```.
        * ```grunt requirejs``` --> builds chalktalk.js and chalktalk.min.js
        * ```grunt watch``` --> builds every time you change a file