import { ErrorRequestHandler } from 'express';
import { HttpError } from 'express-openapi-validator/dist/framework/types';

/** Custom error messages for OpenAPI validation errors. */
export default function validatorErrorHandler() {
    const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
        if (err instanceof HttpError) {
            res.status(500).json({
                message: err.message,
                errors: err.errors,
            });
        } else next(err);
    };

    return errorHandler;
}
