encrypt = (secret, key) => {
  const crypto = require('crypto');
  let algorithm = 'aes-256-ofb'
  , cipher = crypto.createCipheriv(algorithm, key, crypto.randomBytes(16))
  , encryptedText = cipher.update(secret, 'utf8', 'binary');
  encryptedText += cipher.final('binary');
  return encryptedText;
}

generateHeader = (parts, index, header) => {
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

module.exports = {
  encrypt,
  generateHeader
}
