import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import Mail from '../../lib/Mail';

class AnswerOrderController {
    async store(req, resp) {
        const bodySchema = Yup.object().shape({
            answer: Yup.string()
                .required('a pergunta é obrigatória.')
                .min(
                    1,
                    'Numero minimo de caracteres não respeitado, (minimo 20).'
                ),
        });
        const paramsSchema = Yup.object().shape({
            orderId: Yup.number('Id de Aluno obrigatório.')
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

        const { orderId: order_id } = req.params;
        const { answer } = req.body;

        const order = await HelpOrder.findOne({
            where: { id: order_id, answer: null },
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        if (!order) {
            return resp
                .status(401)
                .json({ error: 'Pergunta não encontrada ou já respondida.' });
        }

        order.answer = answer;
        order.answer_at = new Date();
        const {
            id,
            student_id: student,
            question,
            answer_at,
        } = await order.save();

        const { student_name, student_email } = order.student;

        await Mail.sendMail({
            to: `${student_name} <${student_email}>`,
            subject: 'Sua pergunta foi Respondida!.',
            template: 'answered-confirmation',
            context: {
                student_name,
            },
        });

        return resp.json({
            id,
            student,
            question,
            answer,
            answer_at,
        });
    }
}
export default new AnswerOrderController();
