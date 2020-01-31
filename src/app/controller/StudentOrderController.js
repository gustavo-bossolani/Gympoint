import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class StudentOrderController {
    async index(req, resp) {
        const paramsSchema = Yup.object().shape({
            studentId: Yup.number('Id de Aluno obrigatório.')
                .integer('Formato de id de Aluno incorreto.')
                .positive('Formato de id de Aluno incorreto.')
                .required('Id do Aluno é obrigatório.'),
        });

        if (!(await paramsSchema.isValid(req.params))) {
            return resp.status(401).json({ error: 'Erro de validação.' });
        }

        const { studentId: student_id } = req.params;
        const student = await Student.findByPk(student_id);
        if (!student) {
            return resp.status(401).json({ error: 'Aluno não encontrado.' });
        }

        const orders = await HelpOrder.findAll({
            where: { student_id },
            attributes: [
                'id',
                ['student_id', 'student'],
                'question',
                'answer',
                'answer_at',
            ],
        });
        return resp.json(orders);
    }

    async store(req, resp) {
        const bodySchema = Yup.object().shape({
            question: Yup.string()
                .required('a pergunta é obrigatória.')
                .min(
                    5,
                    'Numero minimo de caracteres não respeitado, (minimo 20).'
                )
                .max(200, 'Limite de caracteres excedido, (máximo 200).'),
        });
        const paramsSchema = Yup.object().shape({
            studentId: Yup.number('Id de Aluno obrigatório.')
                .integer('Formato de id de Aluno incorreto.')
                .positive('Formato de id de Aluno incorreto.')
                .required('Id do Aluno é obrigatório.'),
        });

        if (
            !(
                (await bodySchema.isValid(req.body)) &&
                (await paramsSchema.isValid(req.params))
            )
        ) {
            return resp.status(401).json({ error: 'Erro de validação.' });
        }

        const { studentId: student_id } = req.params;
        const { question } = req.body;

        const student = await Student.findByPk(student_id);
        if (!student) {
            return resp.status(401).json({ error: 'Aluno não encontrado.' });
        }

        const { id: help_id } = await HelpOrder.create({
            student_id,
            question,
        });

        return resp.json({
            id: help_id,
            student: student_id,
            question,
        });
    }
}
export default new StudentOrderController();
