const algorithm = 'aes-256-ofb'
, encoding = 'binary';

const encrypt = (clear, key) => {
  const crypto = require('crypto')
  , iv = crypto.randomBytes(16);
  console.log(iv);
  let cipher = crypto.createCipheriv(algorithm, key, iv)
  , encryptedText = iv+cipher.update(clear, '', encoding);
  encryptedText += cipher.final('binary');
  return encryptedText;
}

const decrypt = (secret, key) => {
  const crypto = require('crypto')
  , iv = Buffer.from(secret.slice(0, 16));
  console.log(iv);
  let decipher = crypto.createDecipheriv(algorithm, key, iv)
  , result = decipher.update(secret.slice(16), encoding);
  result += decipher.final();
  return result;
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
        body += line;
      }
    });
    rl.on('close', function() {
      resolve(body);
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
