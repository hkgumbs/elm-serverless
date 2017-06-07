const fs = require('fs');
const path = require('path');
const elm = require('node-elm-compiler');

const runner = 'main';

const run = (serverless, options) => () => {
  const arg = options.function || options.f,
        targets = find(arg, serverless.service.functions);

  return Promise.all(targets.map(compile(serverless)));
};

const compile = (serverless) => (target) => {
  return new Promise((resolve, reject) => {
    const lambda = serverless.service.functions[target],
          provider = serverless.service.provider.name,
          output = artifact(target),
          content = footer(provider, lambda.elm),
          source = code(serverless.config.servicePath, lambda.elm);

    lambda.handler = output.handler;

    return elm.compile(source, { yes: true, output: output.js })
      .on('close', (exitCode) => {
        if (exitCode === 0)
          fs.appendFile(output.js, content, (err) => {
            err ? reject() : resolve()
          });
        else
          reject();
      });
  });
};

const code = (context, mod) => {
  const manifest = require(path.join(context, 'elm-package.json')),
        relative = mod.replace('.', path.sep) + '.elm';

  return manifest['source-directories']
    .map((dir) => path.join(dir, relative))
    .find(fs.existsSync);
};

const footer = (provider, mod) => {
  if (provider === 'aws')
    return lines(
      `module.exports.${runner} = function(event, context, callback) {`,
      `  try {`,
      `    var arg = { event: event, context: context };`,
      `    var resolve = function(data) { callback(null, data); };`,
      `    module.exports.${mod}.worker(arg).ports.done.subscribe(resolve);`,
      `  } catch (e) { callback(e.message); }`,
      `};`
    );
};

const find = (arg, fs) => {
  if (arg == null)
    return Object.keys(fs).filter((key) => fs[key].elm);
  else if (Array.isArray(arg))
    return arg;
  else
    return [arg];
};

const artifact = (target) => {
  const base = path.join('elm-stuff', 'serverless', target);

  return {
    js: base + '.js',
    handler: base + '.' + runner
  };
};

const lines = (...strings) => strings.join('\n');

class Elm {
  constructor(serverless, options) {
    const action = run(serverless, options);

    this.hooks = {
      'before:deploy:createDeploymentArtifacts': action,
      'before:deploy:function:packageFunction': action,
    };
  }
}

module.exports = Elm;
