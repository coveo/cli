const find = require('find-process');
const {exec} = require('child_process');

find('port', 3333).then(
  function (list) {
    if (!list.length) {
      return;
    }

    const stencilCorePath = `${__dirname}/node_modules/@stencil`;
    const isProcessStencil = list[0].cmd.includes(stencilCorePath);

    if (!isProcessStencil) {
      throw new Error(
        'Port 3333 required by Stencil is in use by another process, you can execute "npm run kill:stencil" to forcefully kill it'
      );
    }

    console.log('Killing active Stencil process on port 3333');
    exec('npm run kill:stencil');
  },
  function (err) {
    console.log(err.stack || err);
  }
);
