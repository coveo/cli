export const npm = () => {
  const npmJsPath = require.resolve('npm');
  return ['node', npmJsPath];
};
