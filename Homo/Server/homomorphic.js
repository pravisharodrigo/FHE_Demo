  const SEAL = require('node-seal');
  const fs = require('fs');
  const path = require("path");


  const setupEncryption = async() => {
      const libSEAL = await SEAL();

    const schemeType = libSEAL.SchemeType.bfv;
    const securityLevel = libSEAL.SecurityLevel.tc128;
    const polyModulusDegree = 4096;
    const bitSizes = [36, 36, 37];
    const bitSize = 20;

    const params = libSEAL.EncryptionParameters(schemeType);
    params.setPolyModulusDegree(polyModulusDegree);
    params.setCoeffModulus(libSEAL.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes)));
    params.setPlainModulus(libSEAL.PlainModulus.Batching(polyModulusDegree, bitSize));

    const context = libSEAL.Context(params, true, securityLevel);
    if (!context.parametersSet()) {
      throw new Error('Try different params');
    }

    const keyGen = libSEAL.KeyGenerator(context);
    const secretKey = keyGen.secretKey().save();
    const publicKey = keyGen.createPublicKey().save();

    const base64SecretKey = Buffer.from(secretKey).toString('base64');
    fs.writeFileSync(path.join(__dirname, 'secret.bin'), base64SecretKey, { encoding: 'base64' });

    const base64PublicKey = Buffer.from(publicKey).toString('base64');
    fs.writeFileSync(path.join(__dirname, 'public.bin'), base64PublicKey, { encoding: 'base64' });
  };


  const encryptHEData = async (data) => {
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

      return cipherText.save();
    };




    const decryptHEData = async (data) => {
      const seal = await SEAL();
      const schemeType = seal.SchemeType.bfv
      const securityLevel = seal.SecurityLevel.tc128
      const polyModulusDegree = 4096
      const bitSizes = [36,36,37]
      const bitSize = 20
      
      const encParms = seal.EncryptionParameters(schemeType)
    
      encParms.setPolyModulusDegree(polyModulusDegree)
      
      encParms.setCoeffModulus(
        seal.CoeffModulus.Create(
          polyModulusDegree,
          Int32Array.from(bitSizes)
        )
      )
    
      encParms.setPlainModulus(
        seal.PlainModulus.Batching(
          polyModulusDegree,
          bitSize
        )
      )
    
      const context = seal.Context(
        encParms,
        true,
        securityLevel
      )
    
        const batchEncoder = seal.BatchEncoder(context)
    
      const secretKeyBuffer = fs.readFileSync(path.join(__dirname, 'secret.bin'));
      const Secret_key_x_ = seal.SecretKey() 
      Secret_key_x_.load(context, secretKeyBuffer)
    
      const decryptor = seal.Decryptor(
        context,
        Secret_key_x_
      )
    
    
    
      const uploadedCipherText = seal.CipherText()
    uploadedCipherText.load(context, data)
    const b =decryptor.decrypt(
      uploadedCipherText
    )   
    
    const decodedArray = batchEncoder.decode(b);
    const uint32Array = new Uint32Array(decodedArray)
    const decryptedString = String.fromCharCode(...uint32Array);
    console.log("Decrypted String:", decryptedString);
    
    return decryptedString;
    }

  module.exports ={
      encryptHEData,
      decryptHEData,
      setupEncryption
  }