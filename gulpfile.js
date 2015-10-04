var gulp = require("gulp");
var ts = require("gulp-typescript");
var source = require("vinyl-source-stream");
var mocha = require("gulp-mocha");
var del = require("del");
var listing = require("gulp-task-listing");
var tslint = require("gulp-tslint");
var sourcemaps = require("gulp-sourcemaps");
var path = require("path");

var configTypescript = require("./tsconfig.json").compilerOptions;
configTypescript.typescript = require("typescript");
var tsProject = ts.createProject(configTypescript);

gulp.task("cls", function(){
  console.log("\033[2J");
  console.log("\033c");
});

gulp.task("build", function() {
  return gulp.src(["typings/**/*.d.ts", "src/**/*.ts", "test/**/*.ts"],  {base: "."})
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject))
    .pipe(sourcemaps.write(".", {
      includeContent: false, 
      sourceRoot: function(file) {
        return file.relative.split(path.sep).map(function(){return ".."}).join("/")+"/../";
      } 
    }))
    .pipe(gulp.dest("build/js"));
});

gulp.task("watch", ["build"], function() {
  gulp.watch(["src/**/*.ts", "test/**/*.ts"], ["cls", "build"]);
});

gulp.task("test", ["build"], function () { // Release here somehow circumvents clash between mocha and browserify when running the all task 
  return gulp
    .src("build/js/test/**/*.js")
    .pipe(mocha({
       reporter: "spec"
    }));
});

gulp.task("clean", function (callback) {
  return del([
    "build/*",
    "lib/*",
  ], callback);
});

gulp.task("help", listing);

gulp.task("lint", function () {
  return gulp.src(["src/**/*.ts", "test/**/*.ts"])
    .pipe(tslint())
    .pipe(tslint.report("prose", {
      emitError: false
    }));
});

gulp.task("release", ["build"], function(){
  return gulp.src("build/js/src/**/*.js")
    .pipe(gulp.dest("lib"));
});

gulp.task("all", ["build", "test", "release"]);

gulp.task("default", ["release"]);