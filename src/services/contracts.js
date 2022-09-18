const { Op } = require("sequelize");
const { Contract } = require("../model");


/**
 * @function getNonTerminatedContracts
 * @param {Number} userId userId of the client or contractor
 * @param {Array} statuses Array of contract statuses. Can be 'new', 'in_progress' or 'terminated'.
 *  Defaults to ['in_progress']
 * @returns {Promise} Returns a promsie that resolves to an Array of contracts
 *  associated to the userId with the statuses specified.
 */
const getContracts = (userId, statuses = ['in_progress']) => {
  return Contract.findAll({
    where: {
      [Op.or]: [
        { ClientId: userId },
        { ContractorId: userId }
      ],
      status: statuses
    }
  });
}

const getContract = async (contractId, profileId) => {
  return Contract.findOne({where: {id: contractId, [Op.or]:[
    {
        ContractorId: profileId
    },
    {
        ClientId: profileId
    }
]}});
}


module.exports = { getContracts, getContract };