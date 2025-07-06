export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: 'tsconfig.json'
            },
        ],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
    ],
    testMatch: [
        "**/test/**/*.test.ts",
        "**/tests/**/*.test.ts",
        "**/src/test/**/*.test.ts",
        "**/test/**/*.integration.test.ts",
        "**/tests/**/*.integration.test.ts",
        "**/src/test/**/*.integration.test.ts"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
        "\\.d\\.ts$",
        "test-setup\\.ts$",
        "testSetup\\.ts$",
        "test-provider-utils\\.ts$",
        "TestAIProcessor\\.ts$",
        "mockAIProcessor\\.ts$",
        "testUtils\\.ts$",
        "migrationHelper\\.ts$",
        "migrationMonitor\\.ts$",
        "testMigrationLayer\\.ts$"
    ],
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"]
};
