
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "react": __dirname + '/src/react.js',
        "react-dom": __dirname + '/src/react.js'
      }
    }
  }
};
