const { faker } = require("@faker-js/faker");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

let saltRounds = 10;

const connectionConfig = {
  user: "root",
  password: "90@GH1638@20195597",
  database: "coding_task_development",
  host: "localhost",
};

// Number of records to generate
const numRecords = 100;

async function generateAndInsertData() {
  const connection = await mysql.createConnection(connectionConfig);

  for (let i = 0; i < numRecords; i++) {
    const uuid = uuidv4();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const mobileNumber = faker.phone.number();
    const password = faker.internet.password();
    const registered = faker.datatype.number({
      min: 0,
      max: 1,
    });
    const spam = faker.datatype.number({
      min: 0,
      max: 100,
    });

    // encrypt the password
    let hashed_password = await bcrypt.hash(password, saltRounds);

    const now = new Date(); // Current timestamp

    const insertQuery = `INSERT INTO users (uuid, name, email, password, number, registered, spam, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await connection.query(insertQuery, [
      uuid,
      name,
      email,
      hashed_password,
      mobileNumber,
      registered,
      spam,
      now,
      now,
    ]);
  }

  connection.end();
  console.log("Data generation completed.");
}

generateAndInsertData().catch((err) => {
  console.error("Error:", err);
});
