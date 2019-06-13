import {
  Rule,
  Tree,
  SchematicContext,
  chain,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks'
import { throwError } from 'rxjs';

import { addDependencyToPackageJson, addScriptToPackageJson } from '../../utils/package';
import { devDependencies } from './dependencies';

const TARGET_COMMON_CONFIG_PATH = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js';
const TARGET_TYPESCRIPT_CONFIG_PATH = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/typescript.js';
const NG_ADD_PUG_LOADER_SCRIPT_NAME = 'ng-add-pug-loader.js';

/**
 * Schematics options
 */
export interface NgAddOptions { }

export default function ngAdd(_options: NgAddOptions): Rule {
  return chain([
    validateExecution(),
    addLoadersToPackageJson(),
    addPugRules(),
    addPostInstallScript(),
    addScriptToProject(),
    addPackageInstallTask(),
  ]);
}

/**
 * Checks if everything is fine for command execution
 */
function validateExecution() {
  return (host: Tree) => {
    if (host.exists(NG_ADD_PUG_LOADER_SCRIPT_NAME)) {
      return throwError(new Error('Pug loader is already added.'))
    }
  };
}

/**
 * Inserts `apply-loader` and `pug-loader` packages into
 * application's package.json
 */
function addLoadersToPackageJson() {
  return (host: Tree) => {
    devDependencies.forEach(dependency => {
      addDependencyToPackageJson(host, 'devDependencies', dependency.name, dependency.version);
    });
    return host;
  };
}

/**
 * Inserts the additional Pug rule into CLI's webpack,
 * inside node_modules folder.
 */
function addPugRules() {
  return (tree: Tree) => {
    const commonConfigFile = tree.read(TARGET_COMMON_CONFIG_PATH);
    const typescriptConfigFile = tree.read(TARGET_TYPESCRIPT_CONFIG_PATH);
      
    if (!commonConfigFile || !typescriptConfigFile)
      return throwError(new Error(`CLI's Webpack config was not found. Try running \`npm install\` before running this tool.`));
    
    const commonConfigText = commonConfigFile.toString('utf-8');
    const strPugRules = getPugLoaderRules();

    // make sure we don't add the rule if it already exists
    if (commonConfigText.indexOf(strPugRules) > -1) { return; }

    // We made it this far, let's insert that pug webpack rule
    const position = commonConfigText.indexOf('rules: [') + 8;
    const commonOutput = [commonConfigText.slice(0, position), `\n${strPugRules}`, commonConfigText.slice(position)].join('');

    tree.overwrite(TARGET_COMMON_CONFIG_PATH, commonOutput);

    // now we update the typescript config file for Angular8 to turn off direct template loading  
    const typescriptConfigText = typescriptConfigFile.toString('utf-8');

    // if directTemplateLoading not present (Angular 6) no change needed, if Angular 8 and already set to false, no change needed
    if (typescriptConfigText.indexOf('directTemplateLoading') === -1 || typescriptConfigText.indexOf('directTemplateLoading: false,') > -1) { return; }

    // change needed, make and write it
    const typescriptOutput = typescriptConfigText.replace('directTemplateLoading: true,', 'directTemplateLoading: false,');
    tree.overwrite(TARGET_TYPESCRIPT_CONFIG_PATH, typescriptOutput)
  }
}

/**
 * Add postinstall script to re-add the pug-loader on first app install
 */
function addPostInstallScript() {
  return (host: Tree) => {
    addScriptToPackageJson(host, 'postinstall', `node ./${NG_ADD_PUG_LOADER_SCRIPT_NAME}`);
    return host;
  };
}

/**
 * Creates the script that is run at the postinstall
 * in the application's root folder.
 */
function addScriptToProject() {
  return (tree: Tree, context: SchematicContext) => {
    const files: Tree = url(`../../files`)(context) as Tree;
    const scriptContent = files.read(NG_ADD_PUG_LOADER_SCRIPT_NAME)!.toString('utf-8');

    const modifiedContent = replaceVars(scriptContent, {
      COMMON_CLI_CONFIG_PATH: TARGET_COMMON_CONFIG_PATH,
      TYPESCRIPT_CLI_CONFIG_PATH: TARGET_TYPESCRIPT_CONFIG_PATH,
      PUG_RULES: getPugLoaderRules()
    });

    tree.create(NG_ADD_PUG_LOADER_SCRIPT_NAME, modifiedContent);
  }
}

/**
 * Tell schematics engine that we need a package install after done
 */
function addPackageInstallTask() {
  return (_host: Tree, context: SchematicContext) => {
    const depNames = devDependencies.map(d => d.name).join(' ');
    context.addTask(new NodePackageInstallTask({
      packageName: depNames
    }));
  }
}

function replaceVars(content: string, variables: { [key: string]: string }) {
  const varRegex = /__([a-z0-9_]*)__/gi;
  let match: RegExpExecArray;

  while (match = varRegex.exec(content)!) {
    let [wholeVar, varName] = match;

    if (!variables[varName])
      throw new Error(`Replacement variable not found: ${wholeVar}`);

    content = content.replace(new RegExp(wholeVar, 'g'), variables[varName]);
  }

  return content;
}

function getPugLoaderRules(): string {
  const partialRegex = /\.(include|partial)\.(pug|jade)$/;
  return `
    {
      test: /\\.(pug|jade)$/,
      exclude: ${partialRegex},
      use: [
        { loader: "apply-loader" },
        { loader: "pug-loader" }
      ]
    },
    {
      test: ${partialRegex},
      loader: "pug-loader"
    },`.replace(/\s+/gm, ' ');
}
