import { ErrorRequestHandler } from 'express';
import { HttpError } from 'express-openapi-validator/dist/framework/types';

/** Custom error messages for OpenAPI validation errors. */
export function validatorErrorHandler(): ErrorRequestHandler {
    return (err, _req, res, next) => {
        if (err instanceof HttpError) {
            res.status(err.status).json({
                message: err.message,
                errors: err.errors,
            });
        } else next(err);
    };
}
