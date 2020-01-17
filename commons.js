const algorithm = 'aes-256-ofb'
, encoding = 'binary';

const encrypt = (plain, key) => {
  const crypto = require('crypto');
  const iv = crypto.randomBytes(16);
  const aes = crypto.createCipheriv(algorithm, key, iv);
  let ciphertext = aes.update(plain);
  ciphertext = Buffer.concat([iv, ciphertext, aes.final()]);
  return ciphertext.toString(encoding);
}

const decrypt = (cipher, key) => {
  const crypto = require('crypto');
  const ciphertextBytes = Buffer.from(cipher, encoding)
  , iv = ciphertextBytes.slice(0, 16)
  , data = ciphertextBytes.slice(16)
  , aes = crypto.createDecipheriv(algorithm, key, iv);
  let plaintextBytes = Buffer.from(aes.update(data));
  plaintextBytes = Buffer.concat([plaintextBytes, aes.final()]);
  return plaintextBytes.toString();
}

const generateHeader = (parts, index, header) => {
  return `# THIS FILE IS A HORCRUX.
# IT IS ONE OF ${parts} HORCRUXES THAT EACH CONTAIN PART OF AN ORIGINAL FILE.
# THIS IS HORCRUX NUMBER ${index}.
# IN ORDER TO RESURRECT THIS ORIGINAL FILE YOU MUST FIND THE OTHER ${parts-1} HORCRUX(ES) AND THEN BIND THEM USING THE PROGRAM FOUND AT THE FOLLOWING URL
# https://github.com/jesseduffield/horcrux || https://github.com/hihebark/horcrux-js
-- HEADER --
${JSON.stringify(header)}
-- BODY --
`
}

const returnHeader = (horcruxFile) => {
  const readline = require('readline')
  , fs = require('fs')
  , rl = readline.createInterface({
    input: fs.createReadStream(horcruxFile),
    crlfDelay: Infinity
  });
  let previous = ''
  , header = {};
  return new Promise((resolve, reject) => {
    rl.on('line', (line) => {
      if (!line.startsWith('#') && previous == '-- HEADER --') {
        header = JSON.parse(line);
        rl.close();
      } 
      previous = line;
    });
    rl.on('close', function() {
      resolve(header);
    });
  });

}

const returnBody = (horcruxFile) => {
  const readline = require('readline')
  , fs = require('fs')
  , rl = readline.createInterface({
    input: fs.createReadStream(horcruxFile),
    crlfDelay: Infinity
  });
  let start = false
  , body = '';
  return new Promise((resolve, reject) => {
    rl.on('line', (line) => {
      if (line == '-- BODY --')
        start = true;
      if (start && line != '-- BODY --') {
        body += line+'\n';
      }
    });
    rl.on('close', function() {
      resolve(body.replace(/(\n|\r)+$/, '')); // removing the last `\n` or `\r\n`
    });
  });

}

module.exports = {
  encrypt,
  decrypt,
  generateHeader,
  returnHeader,
  returnBody
}
