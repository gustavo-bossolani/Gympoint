import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
    async store(req, resp) {
        const schema = Yup.object().shape({
            name: Yup.string().required,
            email: Yup.string()
                .email()
                .required(),
        });

        if (!(await schema.isValid(req.body))) {
            return resp.status(400).json({ error: 'Erro de validação' });
        }

        const userExists = await Student.findOne({
            where: { email: req.body.email },
        });

        if (!userExists) {
            return resp.status(400).json({ error: 'Usuário já existe' });
        }

        const { id, name, email } = await Student.create(req.body);

        return resp.json({
            id,
            name,
            email,
        });
    }
}

export default new StudentController();
