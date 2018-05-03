import {
  Rule,
  Tree,
  SchematicContext,
  chain,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks'

import { addDependencyToPackageJson, addScriptToPackageJson } from '../../utils/package';
import { throwError } from 'rxjs';

/**
 * Schematics options
 */
export interface Options { }

const TARGET_CONFIG_PATH = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js';
const NG_ADD_PUG_LOADER_SCRIPT_NAME = 'ng-add-pug-loader.js';

export default function ngAdd(_options: Options): Rule {
  return chain([
    validateExecution(),
    addLoadersToPackageJson(),
    addPugRule(),
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
    addDependencyToPackageJson(host, 'devDependencies', 'apply-loader');
    addDependencyToPackageJson(host, 'devDependencies', 'pug-loader');
    return host;
  };
}

/**
 * Inserts the additional Pug rule into CLI's webpack,
 * inside node_modules folder.
 */
function addPugRule() {
  return (tree: Tree) => {
    const configFile = tree.read(TARGET_CONFIG_PATH);
    if (!configFile)
      return throwError(new Error(`CLI's Webpack config was not found. Try running \`npm install\` before running this tool.`));

    const configText = configFile.toString('utf-8');
    const strPugRule = getPugLoaderRule();

    // make sure we don't add the rule if it already exists
    if (configText.indexOf(strPugRule) > -1) { return; }

    // We made it this far, let's insert that pug webpack rule
    const position = configText.indexOf('rules: [') + 8;
    const output = [configText.slice(0, position), `\n${strPugRule}`, configText.slice(position)].join('');

    tree.overwrite(TARGET_CONFIG_PATH, output);
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
      COMMON_CLI_CONFIG_PATH: TARGET_CONFIG_PATH,
      PUG_RULE: getPugLoaderRule()
    });

    tree.create(NG_ADD_PUG_LOADER_SCRIPT_NAME, modifiedContent);
  }
}

/**
 * Tell schematics engine that we need a package install after done
 */
function addPackageInstallTask() {
  return (_host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
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

function getPugLoaderRule(): string {
  return `{
    test: /.pug$/,
    use: [
      { loader: "apply-loader" },
      { loader: "pug-loader" }
    ]
  },`.replace(/\s+/gm, ' ');
}