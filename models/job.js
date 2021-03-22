"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { id, title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws BadRequestError if job already in database.
     * */

    static async create({ id, title, salary, equity, companyHandle }) {
        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [
                title,
                salary,
                equity,
                companyHandle,
            ],
        );
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`)
        
        return job;
    }

/** Find all jobs.
 *
 * Returns [{ id, title, salary, equity, companyHandle }, ...]
 **/

    static async findAll(filters = {}) {
        let { title, minSalary, hasEquity } = filters
        let queryValues = []
        let expressions = []

        // base query that will display all companies
        let query =
            `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs`;

        if (title) {
            queryValues.push(`%${title}%`)
            expressions.push(`title ILIKE $${queryValues.length}`)
        }

        if (minSalary) {
            queryValues.push(minSalary)
            expressions.push(`salary >= $${queryValues.length}`)
        }

        if (hasEquity === 'true') {
            hasEquity = 0
            queryValues.push(hasEquity)
            expressions.push(`equity > $${queryValues.length}`)
        }

        if (queryValues.length === 0) {
            query += ' ORDER BY id'
            const result = await db.query(query)
            return result.rows

        } else {
            query += " WHERE " + expressions.join(" AND ")
            const result = await db.query(query, queryValues)
            return result.rows
        }
    }

    /** Given a job id, return data about the job.
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];
        
        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

/** Given a company handle, return data about the jobs.
*
* Returns { id, title, salary, equity, companyHandle }
*
* Throws NotFoundError if not found.
**/
    static async getbyHandle(handle) {
        const jobRes = await db.query(
            `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE company_handle = $1`,
            [handle]);

        const jobs = jobRes.rows[0];
        
        if (!jobs) throw new NotFoundError(`No jobs: ${handle}`);

        return jobs;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { title, salary, equity }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data, {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary,
                                equity, 
                                company_handle AS "companyHandle" `;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found.
     **/

    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;