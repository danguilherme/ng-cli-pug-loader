import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/node-package/options';
import { getFileContent } from '@schematics/angular/utility/test';

import { createTestApp, createCommonWebpackConfig } from '../../utils/testing';
import { NgAddOptions } from './';

describe('ng-add', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  const defaultOptions: NgAddOptions = {};

  beforeEach(() => {
    appTree = createTestApp();
    createCommonWebpackConfig(appTree);
    runner = new SchematicTestRunner('schematics', path.join(__dirname, '../collection.json'));
  });

  it('should update package.json', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));

    expect(packageJson.devDependencies['apply-loader']).toBeDefined();
    expect(packageJson.devDependencies['pug-loader']).toBeDefined();
    expect(packageJson.devDependencies['pug']).toBeDefined();
    expect(packageJson.scripts['postinstall']).toBeDefined();
  });

  it('should add the pug loader in webpack config', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const config = eval(getFileContent(tree,
      'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js'));
    const pugRule = config.rules[0];

    expect(config.rules.length).toBe(2);
    expect(pugRule.test.toString()).toBe(/.pug$/.toString());
    expect(pugRule.use.length).toBe(2);

    const loaders = pugRule.use.map((loader: any) => loader.loader);
    expect(loaders).toContain('apply-loader');
    expect(loaders).toContain('pug-loader');
  });

  it('should add script file to ./bin', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    expect(tree.read('/bin/ng-add-pug-loader.js')).toBeTruthy();
  });

  it('should register npm install task', () => {
    runner.runSchematic('ng-add', defaultOptions, appTree);

    expect(runner.tasks.length).toBe(1);

    const npmInstallTask = runner.tasks.filter(t => t.name === 'node-package')[0];
    expect(npmInstallTask).toBeDefined();

    const options = npmInstallTask.options as NodePackageTaskOptions;
    expect(options.command).toBe('install');
    expect(options.packageName).toBeTruthy();
  });
});
