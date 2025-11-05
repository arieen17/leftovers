const pool = require("./database/config");

const checkTable = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants'
      ORDER BY ordinal_position
    `);
    console.log("📋 Restaurant table columns:");
    console.log(result.rows);
  } catch (error) {
    console.error("Error:", error);
  }
};

checkTable();
