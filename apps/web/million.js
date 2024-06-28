// million.js
const MillionLint = require('@million/lint');
const million = require('million/compiler');

const withMillion = (nextConfig = {}) => {
  const millionConfig = {
    auto: true,
    
    filter: {
      include: '@components/*.{mtsx,mjsx,tsx,jsx}',
      exclude: '@node_modules',
     
    },
  };

  return million.next(MillionLint.next()(nextConfig), millionConfig);
};

module.exports = withMillion;