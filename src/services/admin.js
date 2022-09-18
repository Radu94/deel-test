const { QueryTypes } = require("sequelize");
const { sequelize } = require("../model");


const getBestProfession = (startDate, endDate) => {

  return sequelize.query(
    `
    SELECT profession, SUM(price)  as Total FROM Profiles p
    JOIN Contracts c ON c.ContractorId = p.id
    JOIN Jobs j ON c.id = j.ContractId
    WHERE j.paymentDate BETWEEN :startDate AND :endDate
    GROUP BY profession
    ORDER BY Total DESC LIMIT 1;
    `,
    {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT
    }
  );
};

const getHighestPayingClient = (start, end, limit = 2) => {
  return sequelize.query(
    `
    SELECT p.id, p.firstName || ' ' || p.lastName, SUM(j.price) as total FROM Profiles p
    JOIN Contracts c on c.ClientId = p.id
    JOIN Jobs j ON j.ContractId = c.id
    WHERE j.paid IS TRUE AND j.paymentDate BETWEEN :start AND :end
    GROUP BY p.id
    ORDER BY total DESC LIMIT  :limit;
    `,
    {
      replacements: { start, end, limit },
      type: QueryTypes.SELECT
    }
  );

}

module.exports = { getBestProfession, getHighestPayingClient };