/* eslint-disable @typescript-eslint/no-var-requires */
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';

/** Shape of exported config that will be used throughout the app. */
export interface Config {
    port: number;
    clientUrls: string[];
    numProxies: number;
    maxRequestsPerMinute: number;
    rateLimitBypassTokens: string[];
    mongoURI: string;
    mongoDbName: string;
    usernameValidator: RegExp;
    jwtSecret: string;
    discordClientId: string;
    discordClientSecret: string;

    // the following values are not defined in `config.json` and are automatically made
    version: string;
    startedAt: string;
}

/**
 * Expected shape of `config.example.json` and `config.json`.
 *
 * The only differences between this and {@link Config} are:
 * - All values are {@link Partial}, since the JSON files don't **need** to have them (they should all have
 * defaults to fallback to).
 * - Some values have different types, e.g. {@link Config.usernameValidator usernameValidator} is a string here since
 * the RegExp class can't be represented in JSON.
 */
export interface ImportedConfig extends Omit<Partial<Config>, 'usernameValidator'> {
    usernameValidator?: string; // cannot represent a RegExp class in JSON
}

export const defaultConfig: Config = {
    port: 5000,
    clientUrls: [],
    numProxies: 0,
    maxRequestsPerMinute: 30,
    rateLimitBypassTokens: [],
    mongoDbName: 'AIMS_default',
    usernameValidator: new RegExp(/^[a-zA-Z0-9!$&*()[\\]{}<>\\-+_.=";:,|~`^]{2,32}$/),
    jwtSecret: randomBytes(8).toString('hex'),
    // required values
    mongoURI: 'test mongo URI',
    discordClientId: 'test Discord client ID',
    discordClientSecret: 'test Discord client secret',
    // automatic values
    version: process.env.NPM_VERSION || require('../../package.json').version,
    startedAt: new Date().toISOString(),
};

/** Makes a new config object for running tests with. */
export function mockConfig(config?: Partial<Config>): Config {
    return { ...defaultConfig, ...config };
}

/**
 * Creates a config object from `config.json`, using the {@link DefaultConfig} values as
 * fallback.
 * @param {boolean} [useTestConfig=false] Whether to take values from `config.test.json`.
 * @returns {Config} Config object, using {@link defaultConfig defaults} as fallback.
 * @throws Throws an error if required keys (`mongoURI`, `discordClientSecret`, `discordClientId`) are missing.
 * */
export function getConfig(useTestConfig: boolean = false): Config {
    /** Config that we will take values from when forming the final globally-used {@link Config} object. */
    // we use `readFileSync` to prevent caching from `require`, since `config.test.json` can change a lot
    const partialConfig: ImportedConfig = useTestConfig
        ? JSON.parse(readFileSync('config.test.json', 'utf-8'))
        : require('../../config.json');

    if (partialConfig.jwtSecret === undefined) {
        console.warn('Warning: No jwtSecret defined in config, sessions will not persist between resets!');
    }

    if (partialConfig.mongoURI === undefined) {
        throw new Error('No mongoURI defined in config!');
    }

    if (partialConfig.discordClientSecret === undefined) {
        throw new Error('No discordClientSecret defined in config!');
    }

    if (partialConfig.discordClientId === undefined) {
        throw new Error('No discordClientId defined in config!');
    }

    return {
        ...defaultConfig,
        ...partialConfig,
        usernameValidator:
            partialConfig.usernameValidator !== undefined
                ? new RegExp(partialConfig.usernameValidator)
                : defaultConfig.usernameValidator,
    };
}
