///<reference path="../typings/vinyl/vinyl.d.ts" />
///<reference path="../typings/es6-promise/es6-promise.d.ts" />
///<reference path="../typings/compact-dom/compact-dom.d.ts" />

import File = require('vinyl');

import compactDom = require("compact-dom");
import {createGulpStreamWrapper, FilesTransformer} from "./gulp-stream-wrapper";
import {Transform} from "stream";
import {createTypescriptDefinitionsManagerLogic} from "./typescript-definitions-manager-logic";
import * as path from "path";
import * as fs from "fs";

export interface TypescriptCompactDomDefinitionsManager {
  glob: string;
  transform: Transform;
  update: (event: {type:string; path:string}) => void;
};

export let createTypescriptDefinitionsManager = (output: string, glob: string, options: compactDom.Options): TypescriptCompactDomDefinitionsManager => {
  let logic = createTypescriptDefinitionsManagerLogic(options);
  
  let resultFile = <File>undefined;
  let lastResultFileContents = <string>undefined;
  let transform = createGulpStreamWrapper({
    
    handle: (file: File) => {
      return new Promise<File[]>((resolve: (result: File[]) => void) => {
        if (file.isNull()) {
          resolve([]);
        } else if (file.isBuffer()) {
          var converter = compactDom.toHyperscript.createConverter(options);
          logic.addFile(file.path, file.contents.toString())
          resolve([]);
        } else if (file.isStream()) {
          throw new Error("Streaming is not supported");
        }
      });
    },
    
    finish: () => {
      return new Promise<File[]>((resolve: (result: File[]) => void) => {
        resultFile = new File({path:output});
        lastResultFileContents = logic.createOutput();
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
    if (event.type === "changed") {
      logic.updateFile(event.path, fs.readFileSync(event.path).toString());
    } else if (event.type === "added") {
      logic.addFile(event.path, fs.readFileSync(event.path).toString());
    } else {
      logic.removeFile(event.path);
    }
    let newContents = logic.createOutput();
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