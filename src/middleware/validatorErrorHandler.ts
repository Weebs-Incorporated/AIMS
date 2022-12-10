import { HttpError } from 'express-openapi-validator/dist/framework/types';
import { MiddlewareProvider } from '../types';

/** Custom error messages for OpenAPI validation errors. */
export const validatorErrorHandler: MiddlewareProvider = () => (err, _req, res, next) => {
    if (err instanceof HttpError) {
        res.status(err.status).json({
            message: err.message,
            errors: err.errors,
        });
    } else next(err);
};
