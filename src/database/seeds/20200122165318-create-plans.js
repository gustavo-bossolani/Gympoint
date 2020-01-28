module.exports = {
    up: QueryInterface => {
        return QueryInterface.bulkInsert(
            'plans',
            [
                {
                    title: 'Start',
                    duration: 1,
                    price: 129,
                    loyalty_tax: 50,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title: 'Gold',
                    duration: 3,
                    price: 109,
                    loyalty_tax: 75,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title: 'Diamond',
                    duration: 6,
                    price: 89,
                    loyalty_tax: 100,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );
    },

    down: () => {},
};
