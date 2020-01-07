import * as Yup from 'yup';

import jwt from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
    async store(req, resp) {
        const schema = Yup.object().shape({
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string()
                .required()
                .min(6),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação' });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return resp.status(401).json({ error: 'Usuário não existe.' });
        }

        if (!(await user.checkPassword(password))) {
            return resp
                .status(401)
                .json({ error: 'Usuário ou senha incorreto.' });
        }

        const { id, name } = user;

        return resp.json({
            user: {
                id,
                name,
                email,
            },
            toke: jwt.sign({ id, name }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        });
    }
}

export default new SessionController();
