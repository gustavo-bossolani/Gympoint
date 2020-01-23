import { Router } from 'express';

import StudentController from './app/controller/StudentController';
import SessionController from './app/controller/SessionController';
import PlanController from './app/controller/PlanController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.put('/students', StudentController.update);

routes.use(authMiddleware);
routes.post('/students', StudentController.store);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans', PlanController.update);
routes.delete('/plans/:planId', PlanController.delete);

export default routes;
