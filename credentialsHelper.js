const crypto = require('crypto');
const fsextra = require('fs-extra');
const fs = require('fs');

const algorithm = 'aes-256-ecb';
const key = Buffer.from('2a46294a404e635266556a586e3272357538782f413f4428472b4b6150645367', 'hex');

function encryptString(string) {
    let cipher = crypto.createCipheriv(algorithm, key, null);
    let crypted = cipher.update(string, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

function decryptString(string) {
    let decipher = crypto.createDecipheriv(algorithm, key, null);
    let decrypted = decipher.update(string, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

function storeCredentials(userName, password) {
    fsextra.ensureDirSync('./consts');
    let objectToStore = {};
    objectToStore.userName = encryptString(userName);
    objectToStore.password = encryptString(password);
    return fs.writeFileSync('./consts/common.consts.json', JSON.stringify(objectToStore), 'utf8');
};

function getDecodedParameter(parameterName) {
    const objectWithEncryptedData = require('./consts/common.consts.json');
    return decryptString(objectWithEncryptedData[parameterName]);
};

module.exports = {
    storeCredentials,
    getDecodedParameter
};