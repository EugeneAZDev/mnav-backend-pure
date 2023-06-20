'use strict';
const pg = require('pg');
const deletedAtWhere = '"deletedAt" IS NULL';
const crud = (pool) => (table) => ({
  async count(column, values) {
    const valueList = values.map((value) => `'${value}'`).join(', ');
    const sql = `SELECT COUNT(id) FROM "${table}"
       WHERE "${column}" IN (${valueList}) AND ${deletedAtWhere}`;
    const result = await pool.query(sql);
    if (result.rows.length > 0) {
      return result.rows[0].count;
    }
    return 0;
  },

  async create(client = pool, records) {
    const keys = Object.keys(
      records.reduce((acc, record) => ({ ...acc, ...record }), {}),
    );
    const nums = new Array(keys.length * records.length);
    const data = new Array(keys.length * records.length);
    let i = 0;
    records.forEach((record) => {
      keys.forEach((key) => {
        data[i] = record[key];
        nums[i] = `$${++i}`;
      });
    });
    const fields = '"' + keys.join('", "') + '"';
    const params = nums.join(', ');
    const placeholders = Array.from({ length: records.length },
      () => `(${params})`,
    ).join(', ');
    const sql = `INSERT INTO "${table}" (${fields}) VALUES ${placeholders}`;
    return client.query(sql + ' RETURNING *', data);
  },

  async delete(ids) {
    const idsList = ids.map((id) => `'${id}'`).join(', ');
    const sql = `UPDATE "${table}" 
        SET "deletedAt" = NOW() 
        WHERE id IN (${idsList}) AND ${deletedAtWhere}`;
    return pool.query(sql);
  },

  async find(column, values, fields = ['*']) {
    const names = fields.join(', ');
    const valueList = values.map((value) => `'${value}'`).join(', ');
    const sql = `SELECT ${names} FROM "${table}"
       WHERE "${column}" IN (${valueList}) AND ${deletedAtWhere}`;
    return pool.query(sql);
  },

  async read(id, fields = ['*']) {
    const names = fields.join(', ');
    const sql = `SELECT ${names} FROM "${table}" WHERE ${deletedAtWhere}`;
    if (!id) return pool.query(sql);
    return pool.query(`${sql} AND id = $1`, [id]);
  },

  async update(id, { ...record }) {
    const keys = Object.keys(record);
    const updates = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      updates[i] = `"${key}" = $${++i}`;
    }
    const delta = updates.join(', ');
    const sql = `UPDATE "${table}" SET ${delta} WHERE id = $${++i}`;
    data.push(id);
    return pool.query(sql, data);
  },

  async query(sql, args, client = pool) {
    return client.query(sql, args);
  },

  async getClient() {
    return pool;
  }
});

module.exports = (options) => crud(new pg.Pool(options));
