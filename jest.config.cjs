module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/packages", "<rootDir>/apps/mobile", "<rootDir>/scripts"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
  collectCoverageFrom: ["packages/**/*.{ts,tsx}", "apps/mobile/src/**/*.{ts,tsx}", "!**/*.d.ts"],
  moduleNameMapper: {
    "^@mackaye/domain$": "<rootDir>/packages/domain/src",
    "^@mackaye/content-schema$": "<rootDir>/packages/content-schema/src",
    "^@mackaye/sync-core$": "<rootDir>/packages/sync-core/src",
    "^@/(.*)$": "<rootDir>/apps/mobile/src/$1",
  },
};
