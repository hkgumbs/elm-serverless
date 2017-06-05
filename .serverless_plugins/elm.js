const fs = require('fs');
const elm = require('node-elm-compiler');

const output = 'handler.js';
const flags = { yes: true, output: output };

const handle = (serverless, options) => () => {
  return new Promise((resolve, reject) => {
    const target = options.function || options.f;
    const lambda = serverless.service.functions[target];

    lambda.handler = 'handler.serverless';

    return elm.compile(lambda.elm, flags)
      .on('close', (exitCode) => exitCode === 0 ? success(resolve) : reject())
  });
}

const success = (resolve) => {
  const footer = `
    module.exports.serverless = module.exports.Main.serverless;
  `;

  fs.appendFile(output, footer, resolve);
}

class Elm {
  constructor(serverless, options) {
    this.hooks = {
      'before:deploy:createDeploymentArtifacts': handle(serverless, options),
    };
  }
}

module.exports = Elm;
