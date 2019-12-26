import { Router } from 'express';

const routes = new Router();

routes.get('/', (req, resp) => resp.json({ message: 'hello world' }));

export default routes;
