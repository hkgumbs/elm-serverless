const fs = require('fs');
const path = require('path');
const elm = require('node-elm-compiler');

const runner = 'main';
const program = 'worker';
const flags = { yes: true, output: 'handler.js' };

const handle = (service, options) => () => {
  const arg = options.function || options.f;
  const targets = arg ? [arg] : find(service.functions);
  return Promise.all(targets.map(compile(service)));
};

const compile = (service) => (target) => {
  return new Promise((resolve, reject) => {
    const lambda = service.functions[target];
    const provider = service.provider.name;

    lambda.handler = path.basename(flags.output, '.js') + '.' + runner;

    return elm.compile(lambda.elm, flags)
      .on('close', (exitCode) => {
        if (exitCode === 0)
          fs.appendFile(flags.output, footer(provider, lambda.module), resolve);
        else
          reject();
      });
  });
};

const footer = (provider, mod) => {
  if (provider === 'aws')
    return lines(
      `module.exports.${runner} = function(event, context, callback) {`,
      `  try {`,
      `    var arg = { event: event, context: context };`,
      `    var resolve = function(data) { callback(null, data); };`,
      `    module.exports.${mod}.${program}(arg).ports.done.subscribe(resolve);`,
      `  } catch (e) { callback(e.message); };`,
      `};`
    );
};

const find = (functions) => {
  return Object.keys(functions).filter((key) => functions[key].elm);
};

const lines = (...strings) => strings.join('\n');

class Elm {
  constructor(serverless, options) {
    const action = handle(serverless.service, options);

    this.hooks = {
      'before:deploy:createDeploymentArtifacts': action,
      'before:deploy:function:packageFunction': action,
    };
  }
}

module.exports = Elm;
