const { encryptHEData, decryptHEData } = require('./homomorphic');

const testData = "1"; 

const fs = require('fs');


async function testEncryptDecrypt() {
  try {
    console.log("Encrypting data...");
    const encryptedData = await encryptHEData(testData);

    console.log("Decrypting data...");
    const decryptedData = await decryptHEData(encryptedData);

    fs.writeFile("ciper.txt", encryptedData, (err) => {
        if (err)
            console.log(err);
        else {
            console.log("File written successfully\n");
        }
        });

    console.log("Original Data:", testData);
    console.log("Encrypted Data:", encryptedData);
    console.log("Decrypted Data:" , decryptedData);

  } catch (error) {
    console.error("Error:", error);
  }
}

testEncryptDecrypt();
