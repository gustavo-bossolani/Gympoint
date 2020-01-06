import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, resp) => {
    const user = await User.create({
        name: 'Gustavo Bossolani',
        email: 'gustavo.email.com',
        password_hash: '123123123',
    });

    resp.json(user);
});

export default routes;
