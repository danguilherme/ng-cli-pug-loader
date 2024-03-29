> ⚠️ This project is no longer maintained. ⚠️
> 
> Check out [ngx-pug-builders](https://github.com/lekhmanrus/ngx-pug-builders) to add support to pug files to your Angular project.

# Angular CLI Pug Loader

Angular CLI Schematic implementation to add `.pug` file support for your Angular project.

## Usage

At the root of your project, run

```bash
ng add ng-cli-pug-loader
```

That's it, your project now supports pug files:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.pug',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
}
```

### Pug Includes Usage
Because of [pug include](https://pugjs.org/language/includes.html) templates don't work with `apply-loader` (see [related issue](https://github.com/pugjs/pug-loader/issues/105)) we have supported it for `*.partial.pug` and `*.include.pug` files.

Imagine you have `mixins.pug` and `example.partial.pug` for example.

```pug
//- apply-loader and pug-loader will be used
include mixins
//- apply-loader and pug-loader will be used
include mixins.pug
//- pug-loader only will be used
include example.partial.pug
//- pug-loader only will be used
include example.include.pug
```

## Development

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

## Reference

- [Schematics — An Introduction](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
- [Using PUG (or Jade) templates with the Angular-CLI](https://medium.com/@MarkPieszak/using-pug-or-jade-templates-with-the-angular-cli-9e37334db5bc)
- [Angular Material schematics implementation](https://github.com/angular/material2/tree/6.0.0/src/lib/schematics)
- [🏖️ How To Create Your First Custom Angular Schematics With Ease🛠️](https://medium.com/@tomastrajan/%EF%B8%8F-how-to-create-your-first-custom-angular-schematics-with-ease-%EF%B8%8F-bca859f3055d)
