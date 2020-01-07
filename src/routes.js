import { Router } from 'express';

import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.post('/student', UserController.store);

export default routes;
