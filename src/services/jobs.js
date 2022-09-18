const { QueryTypes } = require("sequelize");
const { sequelize, Job, Profile, Contract } = require("../model");


const getUnpaidJobs = async (profileId) => {
  return sequelize.query(
    `SELECT j.* FROM JOBS j
    JOIN Contracts c ON c.id = j.ContractId
    WHERE j.paid  IS NOT TRUE AND c.status = "in_progress" AND (c.ClientId = :profileId OR c.ContractorId = :profileId)`,
    {
      replacements: { profileId },
      type: QueryTypes.SELECT
    }
  )
}

const payJob = async (profileId, jobId) => {
  const transaction = await sequelize.transaction();
  try {
    const job = await Job.findOne({ where: { id: jobId }, transaction: transaction });
    const client = await Profile.findOne({ where: { id: profileId }, transaction: transaction });
    const contract = await Contract.findOne({ where: { id: job.ContractId }, transaction: transaction });

    const canPayJob = client && job && client.balance > job.price;
    if (canPayJob) {
      await Profile.increment({
        balance: job.price
      }, { where: { id: contract.ContractorId }, transaction: transaction });

      await job.update({ paid: true }, { transaction: transaction });

      await Profile.decrement({
        balance: job.price
      }, { where: { id: profileId }, transaction: transaction });
    } else {
      throw new Error('Could not pay out job');
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { getUnpaidJobs, payJob };