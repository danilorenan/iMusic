// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel-preset',  // ← Movido para presets (NativeWind v4)
    ],
    plugins: [
      'react-native-reanimated/plugin',  // ← Deve ser o último plugin
    ],
  };
};