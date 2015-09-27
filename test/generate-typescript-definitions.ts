///<reference path="../typings/gulp/gulp.d.ts" />

import * as gulp from "gulp";


import {createTypescriptCompactDomDefinitionsManager} from "../src/index";

let definitionsManager =  createTypescriptCompactDomDefinitionsManager(
  "compact-dom-definitions.d.ts",
  "../../../test/testproj/**/*.txt",
  {}
);

gulp.src(definitionsManager.glob)
  .pipe(definitionsManager.transform)
  .pipe(gulp.dest("../../../build/test-output"));
  
gulp.watch(definitionsManager.glob, definitionsManager.update);

