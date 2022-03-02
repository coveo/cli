// import {Terminal} from './terminal/terminal';
// import {tmpNameSync, dirSync} from 'tmp';
// import {readFileSync} from 'fs';
// export async function encrypt(sourcePath: string, passphrase: string) {
//   const outputDir = dirSync();
//   const outputPath = tmpNameSync({dir: outputDir.name});
//   const args = [
//     'gpg',
//     '--batch',
//     '--passphrase-fd',
//     '0',
//     '--symmetric',
//     '--cipher-algo',
//     'AES256',
//     '--output',
//     outputPath,
//     sourcePath,
//   ];
//   const encryptTerminal = new Terminal(args.shift()!, args);
//   encryptTerminal.orchestrator.process.stdin.write(passphrase);
//   await encryptTerminal.when('exit').on('process').do().once();
//   return readFileSync(outputPath).toString('base64');
// }

// export async function decrypt(sourcePath: string, passphrase: string) {
//   const outputDir = dirSync();
//   const args = [
//     'gpg',
//     '--batch',
//     '--passphrase',
//     passphrase,
//     '--symmetric',
//     '--yes',
//     sourcePath,
//   ];
//   const decryptTerminal = new Terminal(args.shift()!, args);
//   const exitPromise = decryptTerminal.when('exit').on('process').do().once();
//   let secret = '';
//   await decryptTerminal
//     .when('data')
//     .on('stdout')
//     .do((data) => {
//       secret += data.toString();
//     })
//     .until(exitPromise);
//   return secret;
// }
