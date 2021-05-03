import {readFileSync} from 'fs';
async function main() {
  const packages = ['angular', 'cra-template', 'vue-cli-plugin-typescript'];
  //  const headlessVersion = '0.x';
  packages.forEach((p) => {
    const f = readFileSync(`./packages/${p}/package.json`);
    console.log(f);
  });
}

main();
