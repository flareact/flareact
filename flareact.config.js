module.exports = {
    webpack: (config, { dev, isWorker, defaultLoaders, webpack }) => {
      // Note: we provide webpack above so you should not `require` it
      // Perform customizations to webpack config

      // Custom Webpack Config Here!
      
      // Important: return the modified config
      return config;
    },
  };