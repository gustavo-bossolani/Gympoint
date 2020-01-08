import { Router } from 'express';

import StudentController from './app/controller/StudentController';
import SessionController from './app/controller/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.post('/students', StudentController.store);

export default routes;
