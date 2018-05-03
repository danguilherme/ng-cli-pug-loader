import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export interface Options {
  name: string;
  sourceDir: string;
}

export default function ngAdd(_options: Options): Rule {
  console.log('entrou hein');
  return (tree: Tree, _context: SchematicContext) => {
    const content = tree.read('node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/styles.js')!.toString('utf-8');
    console.log(content);
  };
}
