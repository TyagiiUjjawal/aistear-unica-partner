/* eslint-disable prettier/prettier */
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    minifierPath: 'metro-minify-terser', // Use Terser for minification
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    minifierConfig: {
      // Terser configuration options
      ecma: 8,
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        safari10: true,
      },
      output: {
        comments: false,
        beautify: false,
      },
      compress: {
        drop_console: true,
        passes: 2,
      },
    },
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
