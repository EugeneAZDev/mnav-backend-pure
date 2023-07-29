'use strict';

const up = async (client) => {
  await client.query(`
    ALTER TABLE "ValueDetail" ADD COLUMN "titleValue" varchar(255);
  `);
};

const down = async (client) => {
  await client.query(`
    ALTER TABLE "ValueDetail" DROP COLUMN "titleValue";
  `);
};

module.exports = {
  up,
  down,
};
