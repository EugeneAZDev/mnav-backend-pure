'use strict';
const pg = require('pg');

const TIMESTAMP_OID = 1114;
pg.types.setTypeParser(
  TIMESTAMP_OID,
  (timestamp) => new Date(`${timestamp.slice(0, 19)}Z`),
);
const TYPE_TIMESTAMPTZ = 1184;
pg.types.setTypeParser(TYPE_TIMESTAMPTZ, (timestamp) => timestamp);

const crud = (pool) => (table) => ({
  async create(records, transaction = pool) {
    const keys = Object.keys(
      records.reduce((acc, record) => ({ ...acc, ...record }), {}),
    );
    const nums = new Array(records.length);
    const data = [];
    let i = 1;
    records.forEach((record, index) => {
      const rowData = [];
      keys.forEach((key) => {
        rowData.push(`$${i++}`);
        data.push(record[key]);
      });
      nums[index] = `(${rowData.join(', ')})`;
    });
    const fields = '"' + keys.join('", "') + '"';
    const placeholders = nums.join(', ');
    const sql = `INSERT INTO "${table}" (${fields}) VALUES ${placeholders}`;

    // TODO Modify to convenient naming and rename function to insert
    // CRUD INSERT DEBUG
    // console.log('CRUD INSERT');
    // console.log(sql);
    // console.log(data);

    return this.query(sql + ' RETURNING *', data, transaction);
  },

  async select({
    count, // count: * or count: <column>
    id,
    fields,
    where,
    orderBy,
    transaction = pool,
  }) {
    const args = [];
    const selectedColumns = (() => {
      if (count) {
        if (Array.isArray(count) && count.length !== 1)
          throw Error('count value should be a single');
        return count === '*' ? 'COUNT(*)' : `COUNT(${count})`;
      } else {
        return !fields ? '*' : fields.map((f) => `"${f}"`).join(', ');
      }
    })();
    let sql = `SELECT ${selectedColumns} FROM "${table}"`;
    let finalWhere = { deletedAt: '+NULL' };
    if (id) {
      finalWhere = { id, ...finalWhere };
    } else if (where) {
      finalWhere = { ...where, ...finalWhere };
    }

    const { whereClause, whereArgs } = this.getWhereClause(finalWhere);
    sql += ` WHERE ${whereClause}`;
    args.push(...whereArgs);

    if (orderBy) {
      const orderClause = this.getOrderByClause(orderBy);
      sql += ` ORDER BY ${orderClause}`;
    }

    // CRUD SELECT DEBUG
    // console.log('CRUD SELECT');
    // console.log(sql);
    // console.log(args);

    if (count) {
      const result = await this.query(sql, args, transaction);
      if (result.rows.length > 0) {
        return result.rows[0].count;
      }
      return 0;
    }

    return this.query(sql, args, transaction);
  },

  async update({ id, fields, where, transaction = pool }) {
    const args = [];

    let sql;
    let i = 0;

    if (fields && Reflect.ownKeys(fields).length > 0) {
      console.log(Reflect.ownKeys(fields).length > 0);
      const setKeys = Object.keys(fields);
      const updates = [];
      for (const key of setKeys) {
        args[i] = fields[key];
        updates[i] = `"${key}" = $${++i}`;
      }
      const setClause = updates.join(', ');
      sql = `UPDATE "${table}" SET ${setClause}`;
    } else {
      throw new Error('No fields provided for update');
    }

    let finalWhere = { deletedAt: '+NULL' };
    if (id) {
      finalWhere = { id, ...finalWhere };
    } else if (where) {
      finalWhere = { ...where, ...finalWhere };
    }

    const { whereClause, whereArgs } = this.getWhereClause(finalWhere, i + 1);
    sql += ` WHERE ${whereClause}`;
    args.push(...whereArgs);
    // CRUD UPDATE DEBUG
    // console.log('CRUD UPDATE');
    // console.log(sql);
    // console.log(args);
    return this.query(sql, args, transaction);
  },

  async query(sql, args, transaction = pool) {
    return transaction.query(sql, args);
  },

  getWhereClause(conditions, index = 1) {
    let whereClause = '';
    const args = [];
    let i = index;
    for (const key in conditions) {
      let value = conditions[key];
      let condition;
      if (typeof value === 'number') {
        condition = `"${key}" = $${i}`;
      } else if (typeof value === 'string') {
        if (
          ['>=', '<=', '!=', '>', '<'].some((operator) =>
            value.startsWith(operator),
          )
        ) {
          const operator = value.charAt(0);
          condition = `"${key}" ${operator}= $${i}`;
          value = value.substring(2);
        } else if (value === '+NULL') {
          condition = `"${key}" IS NULL`;
          value = undefined;
          i -= 1;
        } else if (value === '-NULL') {
          condition = `"${key}" IS NOT NULL`;
          value = undefined;
          i -= 1;
        } else if (value.includes('*') || value.includes('?')) {
          value = value.replace(/\*/g, '%').replace(/\?/g, '_');
          condition = `"${key}" LIKE $${i}`;
        } else condition = `"${key}" = $${i}`;
      } else if (Array.isArray(value)) {
        const placeholders =
          // eslint-disable-next-line no-loop-func
          value.map((_, index) => `$${i + index}`).join(', ');
        condition = `"${key}" IN (${placeholders})`;
        i += value.length - 1;
      } else {
        condition = `"${key}" = $${i}`;
      }

      i++;
      if (Array.isArray(value)) {
        value.forEach((v) => args.push(v));
      } else {
        args.push(value);
      }
      whereClause = whereClause ? `${whereClause} AND ${condition}` : condition;
    }

    const whereArgs = args.filter((arg) => arg !== undefined);
    return { whereClause, whereArgs, index: i };
  },

  getOrderByClause(orderBy) {
    const fieldList = orderBy.fields.map((field) =>
      (typeof field === 'number' ? field : `"${field}"`),
    );
    return `${fieldList.join(', ')} ${orderBy.order}`;
  },
});

module.exports = (options) => crud(new pg.Pool(options));
