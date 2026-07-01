module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },

  moduleFileExtensions: ["ts", "tsx", "js"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};