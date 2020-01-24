import * as Yup from 'yup';
import { addMonths, isBefore, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Plan from '../models/Plan';
import Student from '../models/Student';
import Registration from '../models/Registration';

import Mail from '../../lib/Mail';

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

        const hourStart = parseISO(start_date);

        // verifica se o Aluno já não tem um matrícula
        const checkRegistration = await Registration.findOne({
            where: { student_id },
        });

        if (checkRegistration) {
            return resp.status(401).json({
                error: 'O Aluno indicado já possui uma matrícula ativa.',
            });
        }

        // Verificando se a data é passada
        if (isBefore(hourStart, new Date())) {
            return resp.status(401).json({
                error: 'Não é possível iniciar um plano em uma data passada.',
            });
        }

        // Buscando Aluno
        const checkStudent = await Student.findOne({
            where: { id: student_id },
            attributes: ['name', 'email'],
        });

        // Verificando se o Aluno é válido
        if (!checkStudent) {
            return resp.status(401).json({ error: 'Aluno não encontrado.' });
        }

        // Buscando plano
        const checkPlan = await Plan.findOne({
            where: { id: plan_id },
            attributes: ['title', 'duration', 'price'],
        });

        // Verificando se o Plano é válido
        if (!checkPlan) {
            return resp.status(401).json({ error: 'Plano não encontrado.' });
        }

        const total_price = checkPlan.price * Number(checkPlan.duration);
        const end_date = addMonths(hourStart, checkPlan.duration);

        const { id: registration_id } = await Registration.create({
            student_id,
            plan_id,
            start_date: hourStart,
            end_date,
            price: total_price,
        });

        await Mail.sendMail({
            to: `${checkStudent.name} <${checkStudent.email}>`,
            subject: 'Confirmação de Matrícula.',
            template: 'confirmation',
            context: {
                student_name: checkStudent.name,
                plan_name: checkPlan.title,
                total_month: checkPlan.duration,
                total_price,
                plan_price: checkPlan.price,
                start_date: format(hourStart, "'dia' dd 'de' MMMM", {
                    locale: pt,
                }),
                end_date: format(end_date, "'dia' dd 'de' MMMM", {
                    locale: pt,
                }),
            },
        });

        return resp.json({
            registration: {
                id: registration_id,
                start_date: hourStart,
                end_date,
                price: total_price,
            },
            plan: {
                plan_id,
                title: checkPlan.title,
            },
            student: {
                student_id,
                name: checkStudent.name,
                email: checkStudent.email,
            },
        });
    }

    async update(req, resp) {}

    async delete(req, resp) {}
}
export default new RegistrationController();
