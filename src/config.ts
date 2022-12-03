import { randomBytes } from 'crypto';
import { existsSync } from 'fs';

/** Shape of exported config that will be used throughout the app. */
interface Config {
    port: number;
    clientUrls: string[];
    numProxies: number;
    maxRequestsPerMinute: number;
    rateLimitBypassTokens: string[];
    mongoURI: string;
    usernameValidator: RegExp;
    jwtSecret: string;
    jwtDuration: string | number;
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
interface ImportedConfig extends Omit<Partial<Config>, 'usernameValidator'> {
    usernameValidator: string;
}

/**
 * Config that we will take values from when forming the final globally-used {@link Config} object.
 *
 * Although having a `config.json` file is recommended, it is not necessary since this will fallback to
 * `config.example.json`.
 */
const partialConfig: ImportedConfig = existsSync('config.json')
    ? require('../config.json')
    : require('../config.example.json');

if (partialConfig.jwtSecret === undefined) {
    console.log('Warning: No jwtSecret defined in config, sessions will not persist between resets!');
}

if (partialConfig.mongoURI === undefined) {
    console.log('Error: No mongoURI defined in config!');
    process.exit(1);
}

/** Global app config. */
const CONFIG: Config = {
    port: partialConfig.port ?? 5000,
    clientUrls: partialConfig.clientUrls ?? ['http://localhost:5000'],
    numProxies: partialConfig.numProxies ?? 0,
    maxRequestsPerMinute: partialConfig.maxRequestsPerMinute ?? 30,
    rateLimitBypassTokens: partialConfig.rateLimitBypassTokens ?? [],
    mongoURI: partialConfig.mongoURI,
    usernameValidator: new RegExp(
        partialConfig.usernameValidator ?? '^[a-zA-Z0-9!$&*()[\\]{}<>\\-+_.=";:,|~`^]{2,32}$',
    ),
    jwtSecret: partialConfig.jwtSecret ?? randomBytes(8).toString('hex'),
    jwtDuration: partialConfig.jwtDuration ?? '7d',

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    version: process.env.NPM_VERSION || require('../package.json').version,
    startedAt: new Date().toISOString(),
};

export default CONFIG;
