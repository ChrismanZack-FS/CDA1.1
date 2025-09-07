const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);

// Add wasm support if needed
config.resolver.assetExts.push("wasm");

module.exports = withNativeWind(config, { input: "./global.css" });
