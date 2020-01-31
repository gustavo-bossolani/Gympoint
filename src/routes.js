import { Router } from 'express';

import StudentController from './app/controller/StudentController';
import SessionController from './app/controller/SessionController';
import PlanController from './app/controller/PlanController';
import RegistrationController from './app/controller/RegistrationController';
import CheckinController from './app/controller/CheckinController';
import HelpOrderController from './app/controller/HelpOrderController';
import AnswerOrderController from './app/controller/AnswerOrderController';
import StudentOrderController from './app/controller/StudentOrderController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.put('/students', StudentController.update);

routes.post('/students/:studentId/checkins', CheckinController.store);
routes.get('/students/:studentId/checkins', CheckinController.index);

routes.post('/students/:studentId/help-orders', StudentOrderController.store);
routes.get('/students/:studentId/help-orders', StudentOrderController.index);

routes.use(authMiddleware);

routes.get('/help-orders', HelpOrderController.index);

routes.post('/help-orders/:orderId/answer', AnswerOrderController.store);

routes.post('/students', StudentController.store);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans', PlanController.update);
routes.delete('/plans/:planId', PlanController.delete);

routes.get('/registration', RegistrationController.index);
routes.post('/registration', RegistrationController.store);
routes.put('/registration/:registrationId', RegistrationController.update);
routes.delete('/registration/:registrationId', RegistrationController.delete);

export default routes;
