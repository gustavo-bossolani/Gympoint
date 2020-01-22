import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
    async store(req, resp) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email('Email inválido.')
                .required(),
            age: Yup.number()
                .required()
                .positive('Idade inválida.')
                .integer('Idade inválida.'),
            weight: Yup.number()
                .required()
                .positive('Peso inválido.'),
            height: Yup.number()
                .required()
                .positive('Altura inválida.'),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação.' });
        }

        const studentExists = await Student.findOne({
            where: { email: req.body.email },
        });

        if (studentExists) {
            return resp
                .status(400)
                .json({ error: 'Email informado está em uso.' });
        }

        const { id, name, email } = await Student.create(req.body);

        return resp.json({
            id,
            name,
            email,
        });
    }

    async update(req, resp) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string()
                .email('Email inválido.')
                .required('O campo de email é obrigatório.'),
            newEmail: Yup.string().email('Email inválido.'),
            confirmNewEmail: Yup.string()
                .email('Email inválido.')
                .when('newEmail', (newEmail, field) =>
                    newEmail
                        ? field
                              .required('Confirme o novo Email.')
                              .oneOf([Yup.ref('newEmail')])
                        : field
                ),
            age: Yup.number()
                .positive('Idade inválida.')
                .integer('Idade inválida.'),
            weight: Yup.number().positive('Peso inválido.'),
            height: Yup.number().positive('Altura inválida.'),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação.' });
        }

        const student = await Student.findOne({
            where: { email: req.body.email },
        });
        if (!student) {
            return resp.status(400).json({ error: 'Aluno não encontrado.' });
        }

        const { newEmail } = req.body;
        if (newEmail) {
            const studentExists = await Student.findOne({
                where: { email: newEmail },
            });
            if (studentExists) {
                return resp
                    .status(401)
                    .json({ error: 'Aluno já cadastrado com este email.' });
            }
            req.body.email = newEmail;
        }

        const { id, name, email, age, weight, height } = await student.update(
            req.body
        );

        return resp.json({
            id,
            name,
            email,
            age,
            weight,
            height,
        });
    }
}

export default new StudentController();
