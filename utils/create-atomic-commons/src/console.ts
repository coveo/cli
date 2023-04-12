export const successMessage = (componentName: string) => {
  console.log(`
  Project successfully configured

  We suggest that you begin by typing:

  $ cd ${componentName}
  $ npm install
  $ npm start

  $ npm start
    Starts the development server.

  $ npm run build
    Builds your project in production mode.

  Happy coding!`);
};

// TODO: append to success message
// Further reading:

//    - TODO: CDX-1403 Add link to documentation in source code and error message
