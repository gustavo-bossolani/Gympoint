import * as Yup from 'yup';
import {
    addMonths,
    isBefore,
    parseISO,
    format,
    differenceInCalendarDays,
    isSameDay,
    isSameMonth,
    isSameYear,
} from 'date-fns';
import pt from 'date-fns/locale/pt';

import Plan from '../models/Plan';
import Student from '../models/Student';
import Registration from '../models/Registration';

import Mail from '../../lib/Mail';

class RegistrationController {
    async index(req, resp) {
        const { page = 1 } = req.query;

        const registrations = await Registration.findAll({
            order: ['id'],
            limit: 10,
            offset: (page - 1) * 10,
            attributes: [
                'id',
                'start_date',
                'end_date',
                'canceled_at',
                ['price', 'total'],
            ],
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: [
                        'id',
                        'title',
                        'duration',
                        ['price', 'monthly'],
                    ],
                },
            ],
        });
        return resp.json(registrations);
    }

    async store(req, resp) {
        const schema = Yup.object().shape({
            student_id: Yup.number('Formato de id do Aluno está incorreto.')
                .integer('Formato de id do Aluno está incorreto.')
                .positive('Id do Aluno deve ser positivo.')
                .required('Id do Aluno é obrigatório'),
            plan_id: Yup.number('Formato de id do Plano está incorreto.')
                .integer('Formato de id do Plano incorreto.')
                .positive('Id do Plano deve ser positivo.')
                .required('Id do Plano é obrigatório'),
            start_date: Yup.date().required('Data de inicio é obrigatório.'),
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
                error: 'O Aluno indicado já possui uma matrícula.',
            });
        }

        // Verificando se a data é passada
        if (isBefore(hourStart, new Date())) {
            return resp.status(401).json({
                error: 'Não é possível iniciar um plano em uma data passada.',
            });
        }

        // Verificando se a data está dentro de um período de 45 dias
        if (differenceInCalendarDays(hourStart, new Date()) > 45) {
            return resp.status(401).json({
                error:
                    'A data de inicio deve estar dentro de 45 dias da data de matrícula.',
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
                registration_id,
                plan_name: checkPlan.title,
                total_month:
                    checkPlan.duration > 1
                        ? `${checkPlan.duration} meses`
                        : `${checkPlan.duration} mês`,
                total_price,
                plan_price: checkPlan.price,
                start_date: format(hourStart, "'dia' dd 'de' MMMM 'de' yyyy", {
                    locale: pt,
                }),
                end_date: format(end_date, "'dia' dd 'de' MMMM 'de' yyyy", {
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

    async update(req, resp) {
        const schema = Yup.object().shape({
            plan_id: Yup.number(
                'Formato de identificação no plano está inválido.'
            )
                .positive('Valor de identificação do plano deve ser positivo.')
                .integer('Formato de identificação no plano está inválido.'),
            start_date: Yup.date(
                'A data de inicio deve ter o formato de date.'
            ).required('Campo de data de inicio é obrigatório.'),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação.' });
        }

        const { registrationId: reg_id } = req.params;

        const registration = await Registration.findOne({
            where: { id: reg_id },
            attributes: [
                'id',
                'start_date',
                'end_date',
                ['price', 'total'],
                'canceled_at',
            ],
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: [
                        'id',
                        'title',
                        'duration',
                        ['price', 'monthly'],
                        'loyalty_tax',
                    ],
                },
            ],
        });

        if (!registration) {
            return resp.status(400).json({
                error: 'Matrícula não encontrada.',
            });
        }

        const { plan_id: newPlanId, start_date } = req.body;
        const newStartDay = parseISO(start_date);

        // Verificando se o novo plano é o mesmo
        if (registration.plan_id === newPlanId && newPlanId) {
            return resp.status(401).json({
                error: 'Não é possível alterar o plano para o mesmo.',
            });
        }

        // Verificando se a data de inicio é a mesma
        const isSameDate =
            isSameDay(newStartDay, registration.start_date) &&
            isSameMonth(newStartDay, registration.start_date) &&
            isSameYear(newStartDay, registration.start_date);
        if (isSameDate) {
            return resp.status(401).json({
                error: 'Não é possível alterar a data para a mesma.',
            });
        }

        // Verificando se a data é passada
        if (isBefore(newStartDay, new Date())) {
            return resp.status(401).json({
                error: 'Não é possível iniciar um plano em uma data passada.',
            });
        }

        // Verificando se a data está dentro de um período de 45 dias
        if (differenceInCalendarDays(newStartDay, new Date()) > 45) {
            return resp.status(401).json({
                error:
                    'A data de inicio deve estar dentro de 45 dias a partir da data de hoje.',
            });
        }

        if (!newPlanId) {
            // Mudando apenas a data de inicio caso um novo plano não for especificado
            const { start_date: currentStartDate } = registration;
            // Verificando se a data de agora é antes da data de inicio atual
            // Se sim, o Aluno ainda não teve seu plano iniciado
            // Se não, o Aluno já teve seu plano iniciado e não poderá mudar a data
            if (isBefore(new Date(), currentStartDate)) {
                const currentPlanDuration = registration.plan.duration;
                const newEndDate = addMonths(newStartDay, currentPlanDuration);
                registration.start_date = newStartDay;
                registration.end_date = newEndDate;
            } else {
                return resp.status(401).json({
                    error:
                        'Não é possível alterar a data de inicio após de seu plano já ter iniciado.',
                });
            }
        } else {
            // Mudando a data de inicio, fim e preço da matricula, pois o plano foi especificado
            const checkPlan = await Plan.findByPk(newPlanId);
            if (!checkPlan) {
                return resp.status(400).json({
                    error: 'Plano não encontrado.',
                });
            }
            const {
                price: newPlanPrice,
                duration: newPlanDuration,
            } = checkPlan;

            const newTotalPrice = newPlanPrice * Number(newPlanDuration);
            const newEndDate = addMonths(newStartDay, newPlanDuration);

            registration.plan = checkPlan;
            registration.plan_id = newPlanId;
            registration.price = newTotalPrice;
            registration.start_date = newStartDay;
            registration.end_date = newEndDate;
        }

        // Reativando a matrícula em casos de matrículas trancadas
        if (registration.canceled_at) {
            registration.canceled_at = null;
        }

        await registration.save();

        return resp.json(registration);
    }

    async delete(req, resp) {
        const registration = await Registration.findOne({
            where: { id: req.params.registrationId, canceled_at: null },
            attributes: [
                'id',
                'start_date',
                'end_date',
                'canceled_at',
                ['price', 'total'],
            ],
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: [
                        'id',
                        'title',
                        'duration',
                        ['price', 'monthly'],
                    ],
                },
            ],
        });

        if (!registration) {
            return resp.status(400).json({
                error: 'Matrícula está desativa ou não foi encontrada.',
            });
        }

        registration.canceled_at = new Date();

        await registration.save();

        /*
            Verificando a diferença em dias entre a data de
            cancelamento e a data de inicio das aulas
        */
        const difInDays = differenceInCalendarDays(
            registration.canceled_at,
            registration.start_date
        );
        const days = difInDays < 0 ? 0 : difInDays;

        await Mail.sendMail({
            to: `${registration.student.name} <${registration.student.email}>`,
            subject: 'Cancelamento de Matrícula.',
            template: 'cancellation',
            context: {
                student_name: registration.student.name,
                registration_id: registration.id,
                days: days > 1 || days === 0 ? `${days} dias` : `${days} dia`,
            },
        });

        return resp.json(registration);
    }
}
export default new RegistrationController();
