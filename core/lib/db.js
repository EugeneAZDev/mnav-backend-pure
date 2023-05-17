'use strict';

const pg = require('pg');

const crud = (pool) => (table) => ({
  query(sql, args) {
    return pool.query(sql, args);
  },

  async create({ ...record }) {
    const keys = Object.keys(record);
    const nums = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      nums[i] = `$${++i}`;
    }
    const fields = '"' + keys.join('", "') + '"';
    const params = nums.join(', ');
    const sql = `INSERT INTO "${table}" (${fields}) VALUES (${params})`;
    return pool.query(sql + ' RETURNING *', data);
  },

  async count(column, values) {
    const valueList = values.map((value) => `'${value}'`).join(', ');
    const sql =
      `SELECT COUNT(*) FROM "${table}" WHERE "${column}" IN (${valueList})`;
    const result = await pool.query(sql);
    if (result.rows.length > 0) {
      return result.rows[0].count;
    }
    return 0;
  },

  async delete(id) {
    const sql = `DELETE FROM "${table}" WHERE id = $1`;
    return pool.query(sql, [id]);
  },

  async find(column, values, fields = ['*']) {
    const names = fields.join(', ');
    const valueList = values.map((value) => `'${value}'`).join(', ');
    const sql =
      `SELECT ${names} FROM "${table}" WHERE "${column}" IN (${valueList})`;
    return pool.query(sql);
  },

  async read(id, fields = ['*']) {
    const names = fields.join(', ');
    const sql = `SELECT ${names} FROM "${table}"`;
    if (!id) return pool.query(sql);
    return pool.query(`${sql} WHERE id = $1`, [id]);
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
});

module.exports = (options) => crud(new pg.Pool(options));
