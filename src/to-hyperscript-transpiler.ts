///<reference path="../typings/vinyl/vinyl.d.ts" />
///<reference path="../typings/es6-promise/es6-promise.d.ts" />
///<reference path="../typings/compact-dom/compact-dom.d.ts" />

import File = require('vinyl');

import compactDom = require("compact-dom");
import {createGulpStreamWrapper, FilesTransformer} from "./gulp-stream-wrapper";
import {Transform} from "stream";

export let createToHyperscriptTranspiler = (options: compactDom.Options): Transform => {
  
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
