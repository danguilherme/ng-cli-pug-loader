import { join } from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';

const collectionPath = join('./node_modules/@schematics/angular/collection.json');

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

export function createCommonWebpackConfig(host: Tree) {
  host.create(
    'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js',
    `
({
  rules: [
    { test: /.anything$/, loader: 'any-loader' }
  ]
})`);
}