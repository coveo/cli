import setup from './setup';
import path from 'path';
(async () => {
  console.log('boop');
  //https://github.com/oclif/config/blob/1066a42a61a71b9a0708a2beff498d2cbbb9a3fd/src/config.ts#L455
  console.log(
    (process.env.HOMEDRIVE &&
      process.env.HOMEPATH &&
      path.join(process.env.HOMEDRIVE!, process.env.HOMEPATH!)) ||
      process.env.USERPROFILE
  );
  await setup();
})();
