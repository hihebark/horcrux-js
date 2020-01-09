cryptoReader = (key) => {
  const crypto = require('crypto');
  let algorithm = 'aes-256-ofb' //aes256' | 'aes-256-ofb'
  return crypto.createCipheriv(algorithm, key, null); // Not working enless puting iv;
}

generateHeader = (parts, index, header) => {
  return `# THIS FILE IS A HORCRUX.
# IT IS ONE OF ${parts} HORCRUXES THAT EACH CONTAIN PART OF AN ORIGINAL FILE.
# THIS IS HORCRUX NUMBER ${index}.
# IN ORDER TO RESURRECT THIS ORIGINAL FILE YOU MUST FIND THE OTHER ${parts-1} HORCRUX(ES) AND THEN BIND THEM USING THE PROGRAM FOUND AT THE FOLLOWING URL
# https://github.com/jesseduffield/horcrux || https://github.com/hihebark/horcrux-js
-- HEADER --
${JSON.stringify(header)}
-- BODY --`
}

module.exports = {
  cryptoReader,
  generateHeader
}
