import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import * as path from 'path';

import { createTestApp, createCommonWebpackConfig } from '../../utils/testing';
import { NgAddOptions } from '.';

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

  it('should add the apply and pug loaders in webpack config', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const config = eval(getFileContent(tree,
      'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js'));
    const pugRules = config.rules[0];

    expect(config.rules.length).toBe(3);
    expect(pugRules.test.toString()).toBe(/\.(pug|jade)$/.toString());
    expect(pugRules.use.length).toBe(2);
    const loaders = pugRules.use.map((loader: any) => loader.loader);
    expect(loaders).toContain('apply-loader');
    expect(loaders).toContain('pug-loader');
  });

  it('should add the pug loader only for include/partial files in webpack config', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const config = eval(getFileContent(tree,
      'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js'));
    const pugRules = config.rules[1];

    expect(config.rules.length).toBe(3);
    expect(pugRules.test.toString()).toBe(/\.(include|partial)\.(pug|jade)$/.toString());
    expect(pugRules.use.length).toBe(1);
    const loaders = pugRules.use.map((loader: any) => loader.loader);
    expect(loaders).toContain('pug-loader');
  });

  it('should add script file to root', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    expect(tree.read('/ng-add-pug-loader.js')).toBeDefined();
  });

  it('should register npm install task', () => {
    runner.runSchematic('ng-add', defaultOptions, appTree);
    const npmInstallTask = runner.tasks[0];

    expect(npmInstallTask).toBeDefined();
    expect(runner.tasks.length).toBe(1);
    expect(npmInstallTask.name).toBe('node-package');
    expect((npmInstallTask.options as any).command).toBe('install');
  });
});
