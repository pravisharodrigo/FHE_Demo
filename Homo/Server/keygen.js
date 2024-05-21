const { setupEncryption } = require('./homomorphic');

(async () => {
    try {
      const encryptionSetup = await setupEncryption();
      console.log("Keys Generated!");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  })();
  