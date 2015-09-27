///<reference path="../typings/vinyl/vinyl.d.ts" />
///<reference path="../typings/es6-promise/es6-promise.d.ts" />
///<reference path="../typings/compact-dom/compact-dom.d.ts" />

import File = require('vinyl');

import compactDom = require("compact-dom");
import {createGulpStreamWrapper, FilesTransformer} from "./gulp-stream-wrapper";
import {Transform} from "stream";
import {createTypescriptDefinitionsManager} from "./typescript-definitions-manager";
import * as path from "path";
import * as fs from "fs";

let createToHyperscriptTranspiler = (options: compactDom.Options): Transform => {
  
  return createGulpStreamWrapper({
    
    handle: (file: File) => {
      return new Promise<File[]>((resolve: (result: File[]) => void) => {
        if (file.isNull()) {
          resolve([file]);
        } else if (file.isBuffer()) {
          var converter = compactDom.toHyperscript.createConverter(options);
          file.contents = new Buffer(converter.convert(file.contents.toString()));
          resolve([file]);
        } else if (file.isStream()) {
          let stream = <NodeJS.ReadableStream>file.contents;
          file.contents = stream.pipe(compactDom.toHyperscript.createStreamConverter(options));
          resolve([file]);
        }
      });
    }
    
  });
};

interface TypescriptCompactDomDefinitionsManager {
  glob: string;
  transform: Transform;
  update: (event: {type:string; path:string}) => void;
}

let createTypescriptCompactDomDefinitionsManager = (output: string, glob: string, options: compactDom.Options): TypescriptCompactDomDefinitionsManager => {
  let typescriptDefinitionsManager = createTypescriptDefinitionsManager(options);
  
  let resultFile = <File>undefined;
  let lastResultFileContents = <string>undefined;
  let transform = createGulpStreamWrapper({
    
    handle: (file: File) => {
      return new Promise<File[]>((resolve: (result: File[]) => void) => {
        if (file.isNull()) {
          resolve([]);
        } else if (file.isBuffer()) {
          var converter = compactDom.toHyperscript.createConverter(options);
          typescriptDefinitionsManager.addFile(file.path, file.contents.toString())
          resolve([]);
        } else if (file.isStream()) {
          throw new Error("Streaming is not supported");
        }
      });
    },
    
    finish: () => {
      return new Promise<File[]>((resolve: (result: File[]) => void) => {
        resultFile = new File({path:output});
        lastResultFileContents = typescriptDefinitionsManager.createOutput();
        resultFile.contents = new Buffer(lastResultFileContents);
        resolve([resultFile]);
      });
    }

  });
  
  let update = (event: {type:string; path:string}) => {
    if (!resultFile) {
      throw new Error("transform was not yet complete when watching started");
    }
    console.log("type:"+event.type+", path:"+event.path);
    var relative = path.relative(glob.substr(0, glob.indexOf("*")),event.path);
    if (event.type === "changed") {
      typescriptDefinitionsManager.updateFile(relative, fs.readFileSync(event.path).toString());
    } else if (event.type === "added") {
      typescriptDefinitionsManager.addFile(relative, fs.readFileSync(event.path).toString());
    } else {
      typescriptDefinitionsManager.removeFile(relative);
    }
    let newContents = typescriptDefinitionsManager.createOutput();
    if (newContents !== lastResultFileContents) {
      lastResultFileContents = newContents;
      console.log("updating " + resultFile.path);
      fs.writeFileSync(resultFile.path, newContents);
    }
  }
  
  return {
    glob,
    transform,
    update
  }
}

export { createToHyperscriptTranspiler, createTypescriptCompactDomDefinitionsManager };