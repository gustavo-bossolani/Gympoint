import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
    async index(req, resp) {
        const orders = await HelpOrder.findAll({
            where: { answer_at: null },
            attributes: [
                'id',
                ['student_id', 'student'],
                'question',
                'answer',
                'answer_at',
            ],
        });

        return resp.json(orders);
    }
}
export default new HelpOrderController();
