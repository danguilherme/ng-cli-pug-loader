import { Tree } from '@angular-devkit/schematics';

export type DependencyTypes = 'dependencies' | 'devDependencies' | 'optionalDependencies' | 'peerDependencies';

/**
 * Adds a package to the package.json
 */
export function addDependencyToPackageJson(host: Tree, type: DependencyTypes, pkg: string, version: string = 'latest'): Tree {
  if (host.exists('package.json')) {
    const sourceText = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);
    if (!json[type]) {
      json[type] = {};
    }

    if (!json[type][pkg]) {
      json[type][pkg] = version;
    }

    host.overwrite('package.json', JSON.stringify(json, null, 2));
  }

  return host;
}

/**
 * Adds a script to the package.json
 */
export function addScriptToPackageJson(host: Tree, name: string, script: string): Tree {
  if (host.exists('package.json')) {
    const sourceText = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);
    if (!json['scripts']) {
      json['scripts'] = {};
    }

    if (!json['scripts'][name]) {
      json['scripts'][name] = script;
    } else {
      json['scripts'][name] = `${json['scripts'][name]} && ${script}`;
    }

    host.overwrite('package.json', JSON.stringify(json, null, 2));
  }

  return host;
}