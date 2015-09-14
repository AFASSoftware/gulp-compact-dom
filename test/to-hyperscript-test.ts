///<reference path="../typings/gulp/gulp.d.ts" />

import * as gulp from "gulp";

import {createTranspiler} from "../src/index";

gulp.src("../../../test/testproj/**/*.txt")
  .pipe(createTranspiler({}))
  .pipe(gulp.dest("../../../build/test-output"))
