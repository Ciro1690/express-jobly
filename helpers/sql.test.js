const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql")

describe("sqlForPartialUpdate", function () {
    test("works to update users", function () {
        const sql = sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, {
            firstName: "first_name",
            age: "age",
        });
        expect(sql).toEqual({
            "setCols": expect.any(String),
            "values": ["Aliya", 32]
        });
    })
    test("works to update companies", function () {
        const sql = sqlForPartialUpdate({ logoUrl: 'test@test.com', numEmployees: 300 }, {
            logoUrl: "logo_url",
            numEmployees: "num_employees",
        });
        expect(sql).toEqual({
            "setCols": expect.any(String),
            "values": ["test@test.com", 300]
        });
    })
});