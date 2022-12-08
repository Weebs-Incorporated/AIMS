import { randomBytes } from 'crypto';
import { existsSync } from 'fs';

/** Shape of exported config that will be used throughout the app. */
export default interface Config {
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

    // the following values are not defined in `config.json` and are automatically made
    version: string;
    startedAt: string;
}

/**
 * Expected shape of `config.example.json` and `config.json`.
 *
 * The only differences between this and {@link Config} are:
 * - All values are {@link Partial}, since the JSON files don't **need** to have them (they should all have defaults to
 * fallback to).
 * - Some values have different types, e.g. {@link Config.usernameValidator usernameValidator} is a string here since
 * the RegExp class can't be represented in JSON.
 */
interface ImportedConfig extends Omit<Partial<Config>, 'usernameValidator' | 'mongoURI'> {
    usernameValidator: string; // cannot represent a RegExp class in JSON
    mongoURI: string; // mongoURI cannot be partial
}

export const defaultConfig: Omit<Config, 'mongoURI'> = {
    port: 5000,
    clientUrls: [],
    numProxies: 0,
    maxRequestsPerMinute: 30,
    rateLimitBypassTokens: [],
    mongoDbName: 'AIMS_default',
    usernameValidator: new RegExp(/^[a-zA-Z0-9!$&*()[\\]{}<>\\-+_.=";:,|~`^]{2,32}$/),
    jwtSecret: randomBytes(8).toString('hex'),
    jwtDuration: '7d',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    version: process.env.NPM_VERSION || require('../package.json').version,
    startedAt: new Date().toISOString(),
};

/**
 * Makes a new config object for running tests with.
 *
 * If `useEnv` is specified in the partial input config, will attempt to override the default `mongoURI` and
 * `mongoDbName` values with those from `config.json` (if it exists) or `process.env.mongoURI` and
 * `process.env.mongoDbName`.
 *
 * If `config.json` does not exist and `process.env.mongoURI` is missing, will
 * exit the process with status 1.
 */
export function mockConfig(config?: Partial<Config> & { useEnv?: true }): Config {
    let mongoDbName = defaultConfig.mongoDbName;
    let mongoURI = 'test mongo URI';

    if (config?.useEnv) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fromFile = existsSync('config.json') ? (require('../config.json') as ImportedConfig) : false;

        if (fromFile !== false) {
            mongoURI = fromFile.mongoURI;
            mongoDbName = fromFile.mongoDbName || defaultConfig.mongoDbName;
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

    return { ...defaultConfig, ...config, mongoDbName, mongoURI };
}

/** Creates a config object from `config.json`, using the {@link DefaultConfig} values as
 * fallback. */
export function getConfig(): Config {
    /** Config that we will take values from when forming the final globally-used {@link Config} object. */
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const partialConfig: ImportedConfig = require('../config.json');

    if (partialConfig.jwtSecret === undefined) {
        console.log('Warning: No jwtSecret defined in config, sessions will not persist between resets!');
    }

    if (partialConfig.mongoURI === undefined) {
        console.log('Error: No mongoURI defined in config!');
        process.exit(1);
    }

    return {
        ...defaultConfig,
        ...partialConfig,
        usernameValidator: partialConfig.usernameValidator
            ? new RegExp(partialConfig.usernameValidator)
            : defaultConfig.usernameValidator,
    };
}
