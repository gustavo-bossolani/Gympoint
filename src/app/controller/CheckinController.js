import * as Yup from 'yup';
import pt from 'date-fns/locale/pt';

import { parseISO, format } from 'date-fns';

import Checkin from '../schemas/Checkin';
import Student from '../models/Student';

class CheckinController {
    async store(req, resp) {
        const schema = Yup.object().shape({
            studentId: Yup.number(
                'Formato de identificação do aluno está inválido.'
            )
                .positive('Valor de identificação do plano deve ser positivo.')
                .integer('Formato de identificação no plano está inválido.')
                .required('Id de Aluno obrigatório.'),
        });

        if (!(await schema.isValid(req.params))) {
            return resp.status(401).json({
                error: 'Erro de validação.',
            });
        }
        const { studentId: student_id } = req.params;
        const student = await Student.findByPk(student_id);

        if (!student) {
            return resp.status(401).json({
                error: 'Estudante não foi encontrado.',
            });
        }

        const checkinDate = new Date();

        const checkin = await Checkin.create({
            student: student_id,
            message: format(
                checkinDate,
                `'Aluno ${student.name} realizou chekin as' HH:mm'h, do dia' dd 'de' MMMM.`,
                { locale: pt }
            ),
        });

        return resp.json(checkin);
    }

    async index(req, resp) {
        const schema = Yup.object().shape({
            studentId: Yup.number(
                'Formato de identificação do aluno está inválido.'
            )
                .positive('Valor de identificação do plano deve ser positivo.')
                .integer('Formato de identificação no plano está inválido.')
                .required('Id de Aluno obrigatório.'),
        });

        if (!(await schema.isValid(req.params))) {
            return resp.status(401).json({
                error: 'Erro de validação.',
            });
        }

        const { studentId: student_id } = req.params;
        const student = await Student.findByPk(student_id);

        if (!student) {
            return resp.status(400).json({ error: 'Aluno não encontrado.' });
        }

        const notifications = await Checkin.find({
            student: student_id,
        }).sort({ createdAt: 'asc' });

        return resp.json(notifications);
    }
}
export default new CheckinController();
