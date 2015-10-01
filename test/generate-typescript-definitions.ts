import * as gulp from "gulp";

import {createTypescriptDefinitionsManager} from "../src/index";

let definitionsManager =  createTypescriptDefinitionsManager(
  "compact-dom-definitions.d.ts",
  "../../../test/testproj/**/*.txt",
  {}
);

gulp.src(definitionsManager.glob)
  .pipe(definitionsManager.transform)
  .pipe(gulp.dest("../../../build/test-output"));
  
gulp.watch(definitionsManager.glob, definitionsManager.update);

