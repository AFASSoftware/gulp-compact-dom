///<reference path="../typings/gulp/gulp.d.ts" />

import * as gulp from "gulp";

import {createToHyperscriptTranspiler} from "../src/index";

gulp.src("../../../test/testproj/**/*.txt")
  .pipe(createToHyperscriptTranspiler({}))
  .pipe(gulp.dest("../../test-output"))
