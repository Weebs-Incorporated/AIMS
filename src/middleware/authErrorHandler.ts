import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { SiteAuthError } from '../helpers';
import { MiddlewareProvider } from '../types';

export const authErrorHandler: MiddlewareProvider = () => {
    return (err, _req, res, next) => {
        if (err instanceof SiteAuthError) {
            res.status(401).json({
                message: err.message,
            });
        } else if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
            res.status(401).json({
                message: err.message[0].toUpperCase() + err.message.slice(1),
            });
        } else {
            next(err);
        }
    };
};
