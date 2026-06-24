import type { ConfigContext, ExpoConfig } from "expo/config";
import baseConfig from "./app.json";

const publicBaseUrl = process.env.EXPO_PUBLIC_BASE_URL?.replace(/\/+$/, "");

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ...baseConfig.expo,
  experiments: {
    ...baseConfig.expo.experiments,
    ...(publicBaseUrl ? { baseUrl: publicBaseUrl } : {}),
  },
});
