module.exports = {
  // CDX-99: assign port dynamically
  devServer: {
    proxy: 'http://localhost:4000',
  },
};
