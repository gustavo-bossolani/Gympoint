import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, resp, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return resp
            .status(401)
            .json({ error: 'Token de autenticação não foi informado.' });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = await promisify(jwt.verify)(token, authConfig.secret);
        console.log(decoded);

        return next();
    } catch (err) {
        return resp.status(401).json({ error: 'Token inválido' });
    }
};
