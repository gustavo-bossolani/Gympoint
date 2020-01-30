import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import Student from '../app/models/Student';
import Plan from '../app/models/Plan';
import Registration from '../app/models/Registration';

const models = [User, Student, Plan, Registration];

class Database {
    constructor() {
        this.init();
        this.mongo();
    }

    init() {
        this.connection = new Sequelize(databaseConfig);

        models.map(model => model.init(this.connection));
        models.map(model => {
            if (model.associate) {
                model.associate(this.connection.models);
            }
        });
    }

    mongo() {
        this.mongoConnection = mongoose.connect(
            'mongodb://localhost:27017/gympoint',
            {
                useNewUrlParser: true,
                useFindAndModify: true,
                useUnifiedTopology: true,
            }
        );
    }
}

export default new Database();
