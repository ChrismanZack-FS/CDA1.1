const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add wasm support if needed
config.resolver.assetExts.push("wasm");

// Export config directly (NativeWind v2 does not need withNativeWind wrapper)
module.exports = config;
