/**
 * Adds the pug-loader inside Angular CLI's webpack config, if not there yet.
 * @see https://github.com/danguilherme/ng-cli-pug-loader
 */
const fs = require('fs');
const commonCliConfig = '__COMMON_CLI_CONFIG_PATH__';
const pugRules = '__PUG_RULES__';

fs.readFile(commonCliConfig, (err, data) => {
  if (err) throw err;

  const configText = data.toString();
  // make sure we don't add the rule if it already exists
  if (configText.indexOf(pugRules) > -1) { return; }

  // Insert the pug webpack rule
  const position = configText.indexOf('rules: [') + 8;
  const output = [configText.slice(0, position), pugRules, configText.slice(position)].join('');
  const file = fs.openSync(commonCliConfig, 'r+');
  fs.writeFile(file, output, error => {
    if (error)
      console.error("An error occurred while overwriting Angular CLI's Webpack config");

    fs.close(file, () => {});
  });
});

/**
 * Set's directTemplateLoading: false to allow custom pug template loader to work
 * @see https://github.com/angular/angular-cli/issues/14534
 */
const typescriptCliConfig = '__TYPESCRIPT_CLI_CONFIG_PATH__';

fs.readFile(typescriptCliConfig, (err, data) => {
  if (err) { throw err; }

  const typescriptText = data.toString();

  // check if needed to be set or already set
  if (typescriptText.indexOf('directTemplateLoading') === -1 || typescriptText.indexOf('directTemplateLoading: false,') > -1) { return; }
  
  // update the setting
  const output = typescriptText.replace('directTemplateLoading: true,', 'directTemplateLoading: false,');

  // rewrite the file
  const file2 = fs.openSync(typescriptCliConfig, 'r+');  
  fs.writeFile(file2, output, error => {
    if (error)
      console.error("An error occurred while overwriting Angular CLI's Webpack config");

    fs.close(file2, () => {});
  });
});
