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

const angular6TypescriptJsFile =
`const pluginOptions: AngularCompilerPluginOptions = {
    mainPath: useMain ? path.join(root, buildOptions.main) : undefined,
    ...i18nFileAndFormat,
    locale: buildOptions.i18nLocale,
    platform: buildOptions.platform === 'server' ? PLATFORM.Server : PLATFORM.Browser,
    missingTranslation: buildOptions.i18nMissingTranslation,
    sourceMap: buildOptions.sourceMap.scripts,
    additionalLazyModules,
    hostReplacementPaths,
    nameLazyFiles: buildOptions.namedChunks,
    forkTypeChecker: buildOptions.forkTypeChecker,
    contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'),
    logger: wco.logger,
    ...options,
  };`

const angular7orGreaterTypescriptJsFile =
`const pluginOptions: AngularCompilerPluginOptions = {
    mainPath: useMain ? path.join(root, buildOptions.main) : undefined,
    ...i18nFileAndFormat,
    locale: buildOptions.i18nLocale,
    platform: buildOptions.platform === 'server' ? PLATFORM.Server : PLATFORM.Browser,
    missingTranslation: buildOptions.i18nMissingTranslation,
    sourceMap: buildOptions.sourceMap.scripts,
    additionalLazyModules,
    hostReplacementPaths,
    nameLazyFiles: buildOptions.namedChunks,
    forkTypeChecker: buildOptions.forkTypeChecker,
    contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'),
    logger: wco.logger,
    directTemplateLoading: true,
    ...options,
  };`


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

export function createCommonWebpackConfigForAngular6(host: Tree) {
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js", commonJsFile);
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/typescript.js", angular6TypescriptJsFile);
}

export function createCommonWebpackConfigForAngular7orGreater(host: Tree) {
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js", commonJsFile);
    host.create("node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/typescript.js", angular7orGreaterTypescriptJsFile);
}