/**
 * Logs a success message to the console, providing instructions for how to get started with a newly configured project.
 * The componentName parameter should be a string containing the name of the component.
 *
 * @param {string} componentName to include in the success message
 */
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

  Further reading:

   - TODO: CDX-1403 Add link to documentation in source code and error message

  Happy coding!`);
};
