import * as Yup from 'yup';
import { addMonths } from 'date-fns';

import Plan from '../models/Plan';
import Student from '../models/Student';

class RegistrationController {
    async index(req, resp) {}

    async store(req, resp) {
        const schema = Yup.object().shape({
            student_id: Yup.number('Formato de id do Aluno está incorreto.')
                .integer('Formato de id do Aluno está incorreto.')
                .positive('Id do Aluno deve ser positivo.')
                .required('Id do Plano é obrigatório'),
            plan_id: Yup.number('Formato de id do Plano está incorreto.')
                .integer('Formato de id do Plano incorreto.')
                .positive('Id do Plano deve ser positivo.')
                .required('Id do Plano é obrigatório'),
            start_date: Yup.date().required('Id do Plano é obrigatório'),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação.' });
        }

        const { student_id, plan_id, start_date } = req.body;

        const student = await Student.findByPk({
            where: { id: student_id },
            include: {
                model: Student,
                as: 'student',
                attributes: ['id', 'name', 'email'],
            },
        });

        const plan = await Plan.findByPk(plan_id);

        if (!student) {
            return resp.status(401).json({ error: 'Aluno não encontrado.' });
        }
        if (plan) {
            return resp.status(401).json({ error: 'Plano não encontrado.' });
        }

        const { price, duration } = plan;
        const totalPrice = price * duration;
        const endDate = addMonths(start_date, duration);

        const {} = await Registration;
    }

    async update(req, resp) {}

    async delete(req, resp) {}
}
export default new RegistrationController();
