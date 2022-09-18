const { QueryTypes } = require("sequelize");
const { sequelize, Profile } = require("../model");

const depositBalance = async (clientId,amount) => {

  const [{total}] = await sequelize.query(
    `SELECT SUM(price) as total FROM Jobs j
     JOIN Contracts c on c.id = j.ContractId
     WHERE c.status = "in_progress" AND ClientId = :clientId`,
     {
      replacements: {clientId},
      type:QueryTypes.SELECT
     }
  );

  if(amount <= total/4){
    await Profile.increment({balance:amount},{where:{id:clientId}});
  } else {
    throw new Error('Amount is above 25% of total jobs to pay');
  }
  
}

module.exports = { depositBalance };