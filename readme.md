# gulp-compact-dom

Gulp helpers for the compact-dom notation. See [compact-dom](https://github.com/AFASSoftware/compact-dom) for more information.

Receipes:

Transpile compact-dom to hyperscript:

    var compactDom = require('gulp-compact-dom');
    
    gulp.src("src/**/*.js")
      .pipe(compactDom.createToHyperscriptTranspiler({}))
      .pipe(gulp.dest("build/js"))
      
Transpile compact-dom to hyperscript for Mithril:

    var compactDom = require('gulp-compact-dom');
    
    gulp.src("src/**/*.js")
      .pipe(compactDom.createToHyperscriptTranspiler({prefix: "m"}))
      .pipe(gulp.dest("build/js"))
      
