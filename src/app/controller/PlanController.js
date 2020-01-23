import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
    async index(req, resp) {
        const plans = await Plan.findAll({
            attributes: ['id', 'title', 'duration', 'price'],
        });
        return resp.json(plans);
    }

    async store(req, resp) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            duration: Yup.number()
                .positive()
                .integer()
                .required(),
            price: Yup.number().positive(),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação.' });
        }

        const { title, duration, price } = req.body;

        const planExists = await Plan.findOne({
            where: { title },
        });

        if (planExists) {
            return resp
                .status(400)
                .json({ error: 'Já existe um plano com este nome.' });
        }

        await Plan.create(req.body);
        return resp.json({
            title,
            duration,
            price,
        });
    }

    async update(req, resp) {
        const schema = Yup.object().shape({
            title: Yup.string('Formato de titulo inválido.').required(
                'Campo de titulo é obrigatório.'
            ),
            newTitle: Yup.string('Formato do novo titulo é inválido.'),
            duration: Yup.number('Formato de duração de plano é inválido.')
                .positive('Duração do plano deve ter valor positivo.')
                .integer('Formato de duração de plano é inválido.')
                .moreThan(0, 'Duração deve ser maior que 0.'),
            price: Yup.number('Formato de preço do plano é inválido.')
                .positive('O preço do plano dever ser um valor positivo.')
                .moreThan(-1),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação' });
        }

        const { newTitle } = req.body;
        const plan = await Plan.findOne({
            where: { title: req.body.title },
        });
        if (!plan) {
            return resp.status(400).json({ error: 'Plano não encontrado.' });
        }

        if (newTitle) {
            const newPlan = await Plan.findOne({ where: { title: newTitle } });
            if (newPlan) {
                return resp
                    .status(400)
                    .json({ error: 'O novo nome de plano já está em uso.' });
            }
        }
        req.body.title = newTitle;
        const { id, title, duration, price } = await plan.update(req.body);
        return resp.json({
            id,
            title,
            duration,
            price,
        });
    }

    async delete(req, resp) {
        const { planId: id } = req.params;

        const plan = await Plan.findByPk(id);

        if (!plan) {
            return resp.status(401).json({ error: 'Plano não encontrado.' });
        }

        const { title, duration, price } = await plan.destroy();

        return resp.json({ title, duration, price });
    }
}

export default new PlanController();
