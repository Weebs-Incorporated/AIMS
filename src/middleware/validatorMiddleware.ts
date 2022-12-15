import * as OpenApiValidator from 'express-openapi-validator';
import { join } from 'path';
import { MiddlewareProvider } from '../types';

export const validatorMiddleware: MiddlewareProvider = () => {
    return OpenApiValidator.middleware({
        apiSpec: join(__dirname, '../', 'openapi.json'),
        validateRequests: true,
        validateResponses: true,
    });
};
