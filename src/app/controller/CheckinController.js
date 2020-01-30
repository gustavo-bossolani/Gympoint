import * as Yup from 'yup';
import pt from 'date-fns/locale/pt';

import { parseISO, format } from 'date-fns';

import Checkin from '../schemas/Checkin';
import Student from '../models/Student';

class CheckinController {
    async store(req, resp) {
        const { studentId: student_id } = req.params;

        if (!student_id) {
            return resp.status(401).json({
                error: 'Identificação do Aluno no sistema não foi informado.',
            });
        }

        const student = await Student.findByPk(student_id);

        if (!student) {
            return resp.status(401).json({
                error: 'Estudante não foi encontrado.]',
            });
        }

        const checkinDate = new Date().toISOString();

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
}
export default new CheckinController();
