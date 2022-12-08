/* eslint-disable @typescript-eslint/no-var-requires */
import { randomBytes } from 'crypto';
import { existsSync, readFileSync } from 'fs';

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
    jwtDuration: string | number;
    discordClientId: string;
    discordClientSecret: string;

    // the following values are not defined in `config.json` and are automatically made
    version: string;
    startedAt: string;
}

/** These config values MUST be supplied, otherwise the app will not be able to start. */
export type RequiredConfigKeys = keyof Pick<Config, 'mongoURI' | 'discordClientId' | 'discordClientSecret'>;

/** "Default" values for required keys, used for testing only. */
export const requiredConfigKeyFallbacks: Pick<Config, RequiredConfigKeys> = {
    mongoURI: 'test mongo URI',
    discordClientId: 'test Discord client ID',
    discordClientSecret: 'test Discord client secret',
};

/**
 * Expected shape of `config.example.json` and `config.json`.
 *
 * The only differences between this and {@link Config} are:
 * - Non-important values are {@link Partial}, since the JSON files don't **need** to have them (they should all have
 * defaults to fallback to).
 * - Some values have different types, e.g. {@link Config.usernameValidator usernameValidator} is a string here since
 * the RegExp class can't be represented in JSON.
 */
export type ImportedConfig = Omit<Partial<Config>, 'usernameValidator'> &
    Pick<Config, RequiredConfigKeys> & {
        usernameValidator?: string; // cannot represent a RegExp class in JSON
    };

export const defaultConfig: Omit<Config, RequiredConfigKeys> = {
    port: 5000,
    clientUrls: [],
    numProxies: 0,
    maxRequestsPerMinute: 30,
    rateLimitBypassTokens: [],
    mongoDbName: 'AIMS_default',
    usernameValidator: new RegExp(/^[a-zA-Z0-9!$&*()[\\]{}<>\\-+_.=";:,|~`^]{2,32}$/),
    jwtSecret: randomBytes(8).toString('hex'),
    jwtDuration: '7d',
    // automatic values
    version: process.env.NPM_VERSION || require('../../package.json').version,
    startedAt: new Date().toISOString(),
};

/**
 * Makes a new config object for running tests with.
 *
 * `mongoURI` and `mongoDbName` can be retrieved from the `config.json` file (if it exists), or
 * `process.env`. This is done by including the `useEnv` option.
 *
 * If `useEnv` is specified, and both `config.json` and `process.env.mongoURI` do not exist, this function will exit the
 * process with status 1.
 *
 * If a `mongoDbName` is provided from both the parameter input and `process.env.mongoDbName`, the latter will take
 * priority.
 */
export function mockConfig(config?: Partial<Omit<Config, RequiredConfigKeys>> & { useEnv?: true }): Config {
    let mongoDbName = config?.mongoDbName ?? defaultConfig.mongoDbName;
    let mongoURI = requiredConfigKeyFallbacks.mongoURI;

    if (config?.useEnv) {
        if (existsSync('config.json')) {
            const fileConfig: ImportedConfig = require('../../config.json');
            mongoURI = fileConfig.mongoURI;
            if (fileConfig.mongoDbName) mongoDbName = fileConfig.mongoDbName;
        } else {
            if (process.env['mongoURI']) {
                mongoURI = process.env['mongoURI'];
            } else {
                console.log('No mongoURI found in process.env!');
                process.exit(1);
            }
            if (process.env['mongoDbName']) {
                mongoDbName = process.env['mongoDbName'];
            } else {
                console.warn(`No config.json or process.env.mongoDbName, falling back to ${mongoDbName}`);
            }
        }

        delete config.useEnv;
    }

    return {
        ...defaultConfig,
        ...config,
        ...requiredConfigKeyFallbacks,
        mongoURI,
        mongoDbName,
    };
}

/** Creates a config object from `config.json`, using the {@link DefaultConfig} values as
 * fallback. */
export function getConfig(useTestConfig: boolean = false): Config {
    /** Config that we will take values from when forming the final globally-used {@link Config} object. */
    const partialConfig: ImportedConfig = useTestConfig
        ? JSON.parse(readFileSync('config.test.json', 'utf-8'))
        : require('../../config.json');

    if (partialConfig.jwtSecret === undefined && !useTestConfig) {
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
