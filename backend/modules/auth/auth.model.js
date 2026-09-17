const pool = require("../../config/db");

const createUser = async (name, email, passwordHash) => {
    const query = `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, role, created_at;
    `;

    const values = [name, email, passwordHash];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password_hash, role
        FROM users
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail
};