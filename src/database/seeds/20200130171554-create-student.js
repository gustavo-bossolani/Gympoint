module.exports = {
    up: QueryInterface => {
        return QueryInterface.bulkInsert(
            'students',
            [
                {
                    name: 'Gustavo Bossolani',
                    email: 'gustavo@aluno.com',
                    age: 22,
                    weight: 65,
                    height: 1.7,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Fulano da Silva',
                    email: 'fulano@aluno.com',
                    age: 20,
                    weight: 60,
                    height: 1.8,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );
    },

    down: () => {},
};
