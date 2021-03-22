"use strict";

const db = require("../db.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "test",
        salary: 80000,
        equity: 0,
        companyHandle: "c1",
    };

    test("works", async function () {
        let job = await Job.create(newJob);

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job.id}`);
        expect(result.rows).toEqual([
            {
                id: job.id,
                title: "test",
                salary: 80000,
                equity: "0",
                company_handle: "c1",
            },
        ]);
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 100000,
                equity: "0",
                companyHandle: "c1",
            },
            {
                id: expect.any(Number),
                title: "j2",
                salary: 90000,
                equity: "0",
                companyHandle: "c2",
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 80000,
                equity: "0.3",
                companyHandle: "c3",
            },
        ]);
    })


    test("works: with title filter, case insensitive", async function () {
        let jobs = await Job.findAll({ title: 'j1' });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 100000,
                equity: "0",
                companyHandle: "c1",
            }
        ]);
    });

    test("works: with min salary filter", async function () {
        let jobs = await Job.findAll({ minSalary: 95000 });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 100000,
                equity: "0",
                companyHandle: "c1",
            }
        ]);
    });
    test("works: with has equity filter", async function () {
        let jobs = await Job.findAll({ hasEquity: 'true' });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j3",
                salary: 80000,
                equity: "0.3",
                companyHandle: "c3",
            }
        ]);
    });

    test("works: with multiple filters", async function () {
        let jobs = await Job.findAll({ title: "3", minSalary: 80000, hasEquity: "true" });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j3",
                salary: 80000,
                equity: "0.3",
                companyHandle: "c3",
            }
        ]);
    });
});
/************************************** get */

describe("get", function () {
    test("works", async function () {
            const newJob = {
                title: "test",
                salary: 80000,
                equity: 0,
                companyHandle: "c1",
            };
        let newjob = await Job.create(newJob);
        let job = await Job.get(newjob.id);
        expect(job).toEqual({
            id: newjob.id,
            title: "test",
            salary: 80000,
            equity: "0",
            companyHandle: "c1",
        });
    });

    test("not found if no such job", async function () {
        try {
            await job.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof ReferenceError).toBeTruthy();
        }
    });
});

/************************************** update */

const newJob = {
    title: "test",
    salary: 80000,
    equity: 0,
    companyHandle: "c1",
};

describe("update", function () {
    test("works", async function () {
        let newjob = await Job.create(newJob);
        const updateData = {
            title: "testing",
            salary: 90000,
        };
        let job = await Job.update(newjob.id, updateData);
        expect(job).toEqual({
            id: expect.any(Number),
            title: "testing",
            salary: 90000,
            equity: "0",
            companyHandle: "c1",
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = '${newjob.id}'`);
        expect(result.rows).toEqual([{
            id: expect.any(Number),
            title: "testing",
            salary: 90000,
            equity: "0",
            company_handle: "c1",
        }]);
    });

    test("works: null fields", async function () {
        let newjob = await Job.create(newJob);

        const updateDataSetNulls = {
            salary: null,
            equity: null,
        };

        let job = await Job.update(newjob.id, updateDataSetNulls);
        expect(job).toEqual({
            id: newjob.id,
            title: newjob.title,
            companyHandle: newjob.companyHandle,
            ...updateDataSetNulls,
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = '${newjob.id}'`);
        expect(result.rows).toEqual([{
            id: expect.any(Number),
            title: "test",
            salary: null,
            equity: null,
            company_handle: "c1",
        }]);
    });

    test("not found if no such job", async function () {
        try {
            await Job.update("nope", updateData);
            fail();
        } catch (err) {
            expect(err instanceof ReferenceError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        let newjob = await Job.create(newJob);

        try {
            await job.update(newjob.id, {});
            fail();
        } catch (err) {
            expect(err instanceof ReferenceError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        let newjob = await Job.create(newJob);

        await Job.remove(newjob.id);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id='${newjob.id}'`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.remove("nope");
            fail();
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        }
    });
});
