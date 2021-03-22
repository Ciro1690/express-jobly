const { BadRequestError } = require("../expressError");

/** Allows for a partial update by reformatting JS object to SQL that can be updated
 * This can be used for updating both companies and users
 * If no data is passed in, an error will be thrown
 * Otherwise, the keys from the data will be mapped to SQL and SQL injections are prevented
 * 
 * dataToUpdate provides the data as a JS object
 * e.g. { firstName: 'Aliya', age: 32 }
 * 
 * jsToSql provides key value pairs for how the JS parameters need to appear as SQL
 * e.g. {
            firstName: "first_name",
            age: "age",
        }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
