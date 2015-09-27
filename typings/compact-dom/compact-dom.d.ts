// Created manually after struggling with definition files for too long
///<reference path="../node/node.d.ts" />


declare module "compact-dom" {
   
   export interface Options {
     prefix?: string;
   }
   
   export interface Converter {
     convert: (script: string) => string;
     convertLine: (line: string) => string;
   }
   
   export interface ToHyperscript {
     createConverter: (options: Options) => Converter;
     createStreamConverter: (options: Options) => NodeJS.ReadWriteStream;
   }
   
   export var toHyperscript: ToHyperscript
   
   export function createRegExp(options:Options): RegExp
   
}
