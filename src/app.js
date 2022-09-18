const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');
const { getContracts, getContract } = require('./services/contracts');
const { getUnpaidJobs, payJob } = require('./services/jobs');
const { depositBalance } = require('./services/balances');
const { getBestProfession } = require('./services/admin');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id', getProfile, async (req, res) => {
    const { id } = req.params;
    const profileId = req.get('profile_id');
    const contract = await getContract(id, profileId);
    if (!contract) return res.status(404).end()
    res.json(contract)
});

app.get('/contracts', getProfile, async (req, res) => {
    const profileId = req.get('profile_id');
    const contracts = await getContracts(profileId);

    return contracts.length ? res.json(contracts) : res.status(404).end();
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const profileId = req.get('profile_id');

    const unpaidJobs = await getUnpaidJobs(profileId);

    return unpaidJobs.length ? res.json(unpaidJobs) : res.status(404).end();
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const profileId = req.get('profile_id');
    const { job_id: jobId } = req.params;

    try {
        await payJob(profileId, jobId);
        return res.status(200).send({ message: 'Job sucessfully paid' });
    } catch (error) {
        console.log('ERROR:', error);
        return res.status(400).send({ message: error.message });
    }
});

app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const { userId } = req.params;
    const { amount } = req.body;

    try {
        await depositBalance(userId, amount);
        return res.status(200).send({ message: `Succesfully added ${amount}$` });
    } catch (error) {
        return res.status(400).send({ message: 'Could not add to balance' });
    }
});

app.get('/admin/best-profession?start=<date>&end=<date>', getProfile, async (req, res) => {

    const { start, end } = req.query;
    try {
        const bestProfession = await getBestProfession(start, end);
        return res.status(200).send(bestProfession);
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }
});

app.get('/admin/best-clients?start=<date>&end=<date>&limit=<integer>`', getProfile, async (req, res) => {

    const { start, end, limit } = req.query;
    try {
        const bestProfession = await getHighestPayingClient(start, end, limit);
        return res.status(200).send(bestProfession);
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }
});

module.exports = app;
