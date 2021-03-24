#!/usr/bin/env node
/* eslint-disable no-undef */

const getArgs = () => {
  return process.argv.slice(2);
};

const handlePipedContent = () => {
  return new Promise((resolve) => {
    let data = '';

    process.stdin.on('readable', function () {
      const chuck = process.stdin.read();
      if (chuck !== null) {
        data += chuck;
      }
    });
    process.stdin.on('end', function () {
      resolve(data);
    });
  });
};

const handleShellArguments = () => {
  const args = getArgs();
  return args[0];
};

const readArguments = async () => {
  var args = getArgs();

  var isTTY = process.stdin.isTTY;
  //   var stdout = process.stdout;

  // If no STDIN and no arguments, display usage message
  if (isTTY && args.length === 0) {
    console.log('Usage: ');
  }
  // If no STDIN but arguments given
  else if (isTTY && args.length !== 0) {
    handleShellArguments();
  }
  // read from STDIN
  else {
    return await handlePipedContent();
  }
};

module.exports = {
  readArguments,
};
