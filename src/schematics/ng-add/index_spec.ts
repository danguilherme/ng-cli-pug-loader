import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import * as path from 'path';

import { createTestApp, createCommonWebpackConfigForAngular6or7, createCommonWebpackConfigForAngular8 } from '../../utils/testing';
import { NgAddOptions } from '.';

const TARGET_COMMON_CONFIG_PATH = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js';
const TARGET_TYPESCRIPT_CONFIG_PATH = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/typescript.js';

describe('ng-add-angular-6or7', () => {

  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  const defaultOptions: NgAddOptions = {};

  beforeEach(() => {
    appTree = createTestApp();
    createCommonWebpackConfigForAngular6or7(appTree);
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

  it('should add 2 new pug rules', () => {
    const oldConfig = eval(getFileContent(appTree, TARGET_COMMON_CONFIG_PATH));
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const config = eval(getFileContent(tree, TARGET_COMMON_CONFIG_PATH));

    expect(config.rules.length - oldConfig.rules.length).toBe(2);
  });

  it('should add the apply and pug loaders in webpack config', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const config = eval(getFileContent(tree, TARGET_COMMON_CONFIG_PATH));
    const pugRule = config.rules[0];

    expect(pugRule.test.toString()).toBe(/\.(pug|jade)$/.toString());
    expect(pugRule.exclude.toString()).toBe(/\.(include|partial)\.(pug|jade)$/.toString());
    expect(pugRule.use.length).toBe(2);
    const loaders = pugRule.use.map((loader: any) => loader.loader);
    expect(loaders).toContain('apply-loader');
    expect(loaders).toContain('pug-loader');
  });

  it('should add the pug loader only for include/partial files in webpack config', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const config = eval(getFileContent(tree, TARGET_COMMON_CONFIG_PATH));
    const partialPugRule = config.rules[1];

    expect(partialPugRule.test.toString()).toBe(/\.(include|partial)\.(pug|jade)$/.toString());
    expect(partialPugRule.loader).toBe('pug-loader');
  });

  it('should not modify the typescript.js file in webpack config', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const newTypescriptConfig = getFileContent(tree, TARGET_TYPESCRIPT_CONFIG_PATH);

    expect(newTypescriptConfig).not.toContain('directTemplateLoading');
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


describe('ng-add-angular8-specific', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  const defaultOptions: NgAddOptions = {};

  beforeEach(() => {
    appTree = createTestApp();
    createCommonWebpackConfigForAngular8(appTree);
    runner = new SchematicTestRunner('schematics', path.join(__dirname, '../collection.json'));
  });

  it('sthe typescript.js file in webpack config should have directTemplateLoading: false', () => {
    const tree = runner.runSchematic('ng-add', defaultOptions, appTree);
    const newTypescriptConfig = getFileContent(tree, TARGET_TYPESCRIPT_CONFIG_PATH);
    expect(newTypescriptConfig).toContain('directTemplateLoading: false');
  });
});