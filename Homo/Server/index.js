const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const { encryptHEData, decryptHEData } = require('./homomorphic');

const app = express();
const port = process.env.PORT || 3500;

// Configure middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sliit__backup",
});

// Handle POST requests from the React frontend
app.post("/api", async (req, res) => {
  const reportForm = req.body;

  // Check if any of the fields are empty
  for (const key in reportForm) {
    if (!reportForm[key]) {
      return res.status(400).json({
        status: false,
        message: `Field '${key}' is empty. All fields are required.`,
      });
    }
  }

  try {
    // Encrypt the form data using your encryptHEData function
    const encryptedFormData = {
      maths: await encryptHEData(reportForm.maths),
      science: await encryptHEData(reportForm.science),
      history: await encryptHEData(reportForm.history),
      geography: await encryptHEData(reportForm.geography),
      
    };

    // Insert the encrypted data into the MySQL database
    const sqlQ = "INSERT patients2 (maths, science,history, geography) VALUES (?, ?, ?, ?, ?, ?, ?)";
    console.log("SQL Query:", sqlQ);

    pool.query(
      sqlQ,
      [
        encryptedFormData.maths,
        encryptedFormData.science,
        encryptedFormData.history,
        encryptedFormData.geography,
        
      ],
      (err, results) => {
        if (err) {
          console.error("Error inserting data: ", err);
          res.status(500).json({ status: false, message: "Something went wrong" });
        } else {
          res.status(200).json({ status: true, message: "Data inserted successfully" });
        }
      }
    );
  } catch (err) {
    console.error("Error encrypting data: ", err);
    res.status(500).json({ status: false, message: "Error encrypting data" });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
