import * as OpenApiValidator from 'express-openapi-validator';

export default function validatorMiddleware() {
    return OpenApiValidator.middleware({
        apiSpec: './openapi.json',
        validateRequests: true,
        validateResponses: true,
    });
}
