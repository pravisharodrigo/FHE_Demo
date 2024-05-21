const express = require('express');
const bodyParser = require('body-parser');
const SEAL = require('node-seal');
const fs = require('fs');
const path = require('path');




(async () => {
  const app = express();
  const port = 3000;

  app.use(bodyParser.json());

  const libSEAL = await SEAL();
  const schemeType = libSEAL.SchemeType.bfv;
  const securityLevel = libSEAL.SecurityLevel.tc128;
  const polyModulusDegree = 4096;
  const bitSizes = [36, 36, 37];
  const bitSize = 20;

  const encParams = libSEAL.EncryptionParameters(schemeType);
  encParams.setPolyModulusDegree(polyModulusDegree);
  encParams.setCoeffModulus(libSEAL.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes)));
  encParams.setPlainModulus(libSEAL.PlainModulus.Batching(polyModulusDegree, bitSize));

  const context = libSEAL.Context(encParams, true, securityLevel);

  const publicKeyBuffer = fs.readFileSync(path.join(__dirname, 'public.bin'));
  const publicKey = libSEAL.PublicKey();
  publicKey.load(context, publicKeyBuffer);

  app.post('/encrypt', async (req, res) => {
    const data = req.body.plaintext;

    const batchEncoder = libSEAL.BatchEncoder(context);

    const encryptor = libSEAL.Encryptor(context, publicKey);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);

    const dataView = new DataView(bytes.buffer);

    const uint32Array = new Uint32Array(bytes.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    for (let i = 0; i < uint32Array.length; i++) {
        uint32Array[i] = dataView.getUint32(i * Uint32Array.BYTES_PER_ELEMENT, true);
    }
    const plainText = batchEncoder.encode(uint32Array);

    const cipherText = await encryptor.encrypt(plainText);

    res.json({ encrypted: cipherText.save() });
  });

  app.post('/add', (req, res) => {
    const encryptedNum1 = libSEAL.Ciphertext.deserialize(context, JSON.parse(req.body.encryptedNum1));
    const encryptedNum2 = libSEAL.Ciphertext.deserialize(context, JSON.parse(req.body.encryptedNum2));

    const evaluator = new libSEAL.Evaluator(context);

    const sum = new libSEAL.Ciphertext();
    evaluator.add(encryptedNum1, encryptedNum2, sum);

    res.json({ sum: sum.save() });
  });

  app.post('/multiply', (req, res) => {
    const encryptedNum1 = libSEAL.Ciphertext.deserialize(context, JSON.parse(req.body.encryptedNum1));
    const plaintextMultiplier = parseInt(req.body.plaintextMultiplier);

    const evaluator = new libSEAL.Evaluator(context);

    const product = new libSEAL.Ciphertext();
    evaluator.multiply_plain(encryptedNum1, plaintextMultiplier, product);

    res.json({ product: product.save() });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
