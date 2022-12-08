import { existsSync, rmSync, writeFileSync } from 'fs';
import { defaultConfig, getConfig, mockConfig } from './config';

describe('config', () => {
    describe('mockConfig', () => {
        it('returns default config when called with no arguments', () => {
            const mockedConfig = mockConfig();
            expect(mockedConfig).toEqual({ ...defaultConfig, mongoURI: mockedConfig.mongoURI });
        });

        it('allows partial overrides', () => {
            const mockedConfig = mockConfig({ numProxies: 5 });
            expect(mockedConfig).toEqual({ ...defaultConfig, mongoURI: mockedConfig.mongoURI, numProxies: 5 });
        });

        it('reads config.json or process.env if useEnv is provided', () => {
            const mockedConfig = mockConfig({ useEnv: true });

            if (existsSync('config.json')) {
                const actualConfig = getConfig();
                expect(mockedConfig.mongoURI).toBe(actualConfig.mongoURI);
                expect(mockedConfig.mongoDbName).toBe(actualConfig.mongoDbName ?? defaultConfig.mongoDbName);
            } else {
                expect(mockedConfig.mongoURI).toBe(process.env['mongoURI']);
                expect(mockedConfig.mongoDbName).toBe(process.env['mongoDbName'] ?? defaultConfig.mongoDbName);
            }
        });
    });

    describe('getConfig', () => {
        afterEach(() => {
            rmSync('config.test.json');
        });

        it('falls back to default values when actual ones are omitted', () => {
            writeFileSync('config.test.json', JSON.stringify({ mongoURI: '123' }), 'utf-8');

            expect(getConfig(true)).toEqual({ ...defaultConfig, mongoURI: '123' });
        });

        it('throws an error if no MongoURI is present', () => {
            writeFileSync('config.test.json', JSON.stringify({ port: 6000 }), 'utf-8');

            expect(() => getConfig(true)).toThrow();
        });
    });
});
