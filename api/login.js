
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed'
    });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      message: 'Database not configured'
    });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: 'Enter username and password'
    });
  }

  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE username = $1',
      [username]
    );

    const valid = result.rows.length > 0 &&
      await bcrypt.compare(
        password,
        result.rows[0].password_hash
      );

    return res.status(valid ? 200 : 401).json({
      message: valid
        ? 'Login Successful!'
        : 'Invalid Username or Password'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Database error'
    });
  }
};
