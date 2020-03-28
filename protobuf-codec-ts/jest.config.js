module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    globals: {
        "ts-jest": {
            tsConfig: 'test/tsconfig.json',
            packageJson: 'package.json',
            isolatedModules: true,
        },
    },
};
