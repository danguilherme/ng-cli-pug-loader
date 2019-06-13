import { join } from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';

const collectionPath = join('./node_modules/@schematics/angular/collection.json');
const commonJsFile = 
`({
    rules: [
        { test: /.anything$/, loader: 'any-loader' }
    ]
})`

const angular8TypescriptJsFile =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
const path = require("path");
const webpack_1 = require("@ngtools/webpack");
const common_1 = require("./common");
function _pluginOptionsOverrides(buildOptions, pluginOptions) {
    const compilerOptions = {
        ...(pluginOptions.compilerOptions || {})
    };
    const hostReplacementPaths = {};
    if (buildOptions.fileReplacements) {
        for (const replacement of buildOptions.fileReplacements) {
            hostReplacementPaths[replacement.replace] = replacement.with;
        }
    }
    if (buildOptions.scriptTargetOverride) {
        compilerOptions.target = buildOptions.scriptTargetOverride;
    }
    if (buildOptions.preserveSymlinks) {
        compilerOptions.preserveSymlinks = true;
    }
    return {
        ...pluginOptions,
        hostReplacementPaths,
        compilerOptions
    };
}
function _createAotPlugin(wco, options, useMain = true, extract = false) {
    const { root, buildOptions } = wco;
    const i18nInFile = buildOptions.i18nFile
        ? path.resolve(root, buildOptions.i18nFile)
        : undefined;
    const i18nFileAndFormat = extract
        ? {
            i18nOutFile: buildOptions.i18nFile,
            i18nOutFormat: buildOptions.i18nFormat,
        } : {
        i18nInFile: i18nInFile,
        i18nInFormat: buildOptions.i18nFormat,
    };
    const additionalLazyModules = {};
    let pluginOptions = {
        mainPath: useMain ? path.join(root, buildOptions.main) : undefined,
        ...i18nFileAndFormat,
        locale: buildOptions.i18nLocale,
        platform: buildOptions.platform === 'server' ? webpack_1.PLATFORM.Server : webpack_1.PLATFORM.Browser,
        missingTranslation: buildOptions.i18nMissingTranslation,
        sourceMap: buildOptions.sourceMap.scripts,
        additionalLazyModules,
        nameLazyFiles: buildOptions.namedChunks,
        forkTypeChecker: buildOptions.forkTypeChecker,
        contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'),
        logger: wco.logger,
        directTemplateLoading: true,
        ...options,
    };
    pluginOptions = _pluginOptionsOverrides(buildOptions, pluginOptions);
    return new webpack_1.AngularCompilerPlugin(pluginOptions);
}
function getNonAotConfig(wco) {
    const { tsConfigPath } = wco;
    return {
        module: {},
        plugins: [_createAotPlugin(wco, { tsConfigPath, skipCodeGeneration: true })]
    };
}
exports.getNonAotConfig = getNonAotConfig;
function getAotConfig(wco, extract = false) {
    const { tsConfigPath, buildOptions } = wco;
    const loaders = [webpack_1.NgToolsLoader];
    if (buildOptions.buildOptimizer) {
        loaders.unshift({
            loader: common_1.buildOptimizerLoader,
            options: { sourceMap: buildOptions.sourceMap.scripts }
        });
    }
    const test = /(?:\.ngfactory\.js|\.ngstyle\.js|\.tsx?)$/;
    return {
        module: {},
        plugins: [_createAotPlugin(wco, { tsConfigPath }, true, extract)]
    };
}
exports.getAotConfig = getAotConfig;
function getTypescriptWorkerPlugin(wco, workerTsConfigPath) {
    const { buildOptions } = wco;
    let pluginOptions = {
        skipCodeGeneration: true,
        tsConfigPath: workerTsConfigPath,
        mainPath: undefined,
        platform: webpack_1.PLATFORM.Browser,
        sourceMap: buildOptions.sourceMap.scripts,
        forkTypeChecker: buildOptions.forkTypeChecker,
        contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'),
        logger: wco.logger,
        // Run no transformers.
        platformTransformers: [],
        // Don't attempt lazy route discovery.
        discoverLazyRoutes: false,
    };
    pluginOptions = _pluginOptionsOverrides(buildOptions, pluginOptions);
    return new webpack_1.AngularCompilerPlugin(pluginOptions);
}
exports.getTypescriptWorkerPlugin = getTypescriptWorkerPlugin;`

const angular6or7TypescriptJsFile =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack_1 = require("@ngtools/webpack");
const common_1 = require("./common");
function _createAotPlugin(wco, options, _host, useMain = true, extract = false) {
    const { root, buildOptions } = wco;
    options.compilerOptions = options.compilerOptions || {};
    if (wco.buildOptions.preserveSymlinks) {
        options.compilerOptions.preserveSymlinks = true;
    }
    let i18nInFile = buildOptions.i18nFile
        ? path.resolve(root, buildOptions.i18nFile)
        : undefined;
    const i18nFileAndFormat = extract
        ? {
            i18nOutFile: buildOptions.i18nFile,
            i18nOutFormat: buildOptions.i18nFormat,
        } : {
        i18nInFile: i18nInFile,
        i18nInFormat: buildOptions.i18nFormat,
    };
    const additionalLazyModules = {};
    const hostReplacementPaths = {};
    if (buildOptions.fileReplacements) {
        for (const replacement of buildOptions.fileReplacements) {
            hostReplacementPaths[replacement.replace] = replacement.with;
        }
    }
    const pluginOptions = null;
    return new webpack_1.AngularCompilerPlugin(pluginOptions);
}
function getNonAotConfig(wco, host) {
    const { tsConfigPath } = wco;
    return {
        module: {},
        plugins: []
    };
}
exports.getNonAotConfig = getNonAotConfig;
function getAotConfig(wco, host, extract = false) {
    const { tsConfigPath, buildOptions } = wco;
    const loaders = [webpack_1.NgToolsLoader];
    if (buildOptions.buildOptimizer) {
        loaders.unshift({
            loader: common_1.buildOptimizerLoader,
            options: { sourceMap: buildOptions.sourceMap.scripts }
        });
    }
    const test = /(?:\.ngfactory\.js|\.ngstyle\.js|\.tsx?)$/;
    return {
        module: {},
        plugins: []
    };
}
exports.getAotConfig = getAotConfig;
function getNonAotTestConfig(wco, host) {
    const { tsConfigPath } = wco;
    return {
        module: {},
        plugins: []
    };
}
exports.getNonAotTestConfig = getNonAotTestConfig;`


/**
 * Create a base app used for testing.
 */
export function createTestApp(): UnitTestTree {
  const baseRunner = new SchematicTestRunner('schematics', collectionPath);
  const tree = baseRunner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  });
  return baseRunner.runSchematic('application', {
    directory: '',
    name: 'test-app',
    prefix: 'app',
    sourceDir: 'src',
    inlineStyle: false,
    inlineTemplate: false,
    viewEncapsulation: 'None',
    version: '1.2.3',
    routing: true,
    style: 'scss',
    skipTests: false,
    minimal: false,
  }, tree);
}

export function createCommonWebpackConfigForAngular6or7(host: Tree) {
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js", commonJsFile);
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/typescript.js", angular6or7TypescriptJsFile);
}

export function createCommonWebpackConfigForAngular8(host: Tree) {
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js", commonJsFile);
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/typescript.js", angular8TypescriptJsFile);
}