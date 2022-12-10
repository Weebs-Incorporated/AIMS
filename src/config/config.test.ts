import { rmSync, writeFileSync } from 'fs';
import { Config, defaultConfig, getConfig, ImportedConfig, mockConfig } from './config';

describe('config', () => {
    describe('mockConfig', () => {
        it('returns default config when called with no arguments', () => {
            expect(mockConfig()).toEqual(defaultConfig);
        });

        it('allows partial overrides', () => {
            expect(mockConfig({ numProxies: 5 })).toEqual({ ...defaultConfig, numProxies: 5 });
        });
    });

    describe('getConfig', () => {
        const minRequiredConfig: Partial<Config> = {
            mongoURI: defaultConfig.mongoURI,
            discordClientId: defaultConfig.discordClientId,
            discordClientSecret: defaultConfig.discordClientSecret,
        };

        afterEach(() => {
            rmSync('config.test.json');
        });

        it('returns default config when config file is empty', () => {
            writeFileSync('config.test.json', JSON.stringify(minRequiredConfig), 'utf-8');
            expect(getConfig(true)).toEqual(defaultConfig);
        });

        it('allows partial overrides', () => {
            writeFileSync('config.test.json', JSON.stringify({ ...minRequiredConfig, numProxies: 5 }), 'utf-8');
            expect(getConfig(true)).toEqual({ ...defaultConfig, numProxies: 5 });
        });

        it('throws an error if required keys are missing', () => {
            const missingConfig = { ...defaultConfig, mongoURI: undefined };
            writeFileSync('config.test.json', JSON.stringify(missingConfig), 'utf-8');

            expect(() => getConfig(true)).toThrowError();
        });

        it("converts 'usernameValidator' into a RegExp", () => {
            const customConfig: ImportedConfig = { ...minRequiredConfig, usernameValidator: '^[a-zA-Z0-9]' };
            writeFileSync('config.test.json', JSON.stringify(customConfig), 'utf-8');
            expect(getConfig(true).usernameValidator.toString()).toEqual('/^[a-zA-Z0-9]/');
        });
    });
});
