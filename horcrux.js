/**
 * Horcrux:
 * @param {String} options.filename
 * @param {String} options.output
 * @param {Number} options.parts
 * @param {Number} options.threshold
 **/

function Horcrux (options) {

  var filename;
  if (typeof options == 'string') {
    filename = options;
  } else {
    options = options || {};
    filename = options.filename;
  }
  this.filename = filename;
  this.output = options.output;
  this.parts = options.parts;
  this.threshold = options.threshold;
  if (this.parts > 255)
    throw new Error('parts cannot exceed 255');
  if ((this.parts && this.threshold) && (this.parts < this.threshold))
    throw new Error('parts cannot be less than threshold');
  if (this.threshold < 2)
    throw new Error('threshold must be at least 2');
  if (this.threshold > 255)
    throw new Error('threshold cannot exceed 255')

}

Horcrux.prototype.split = function () {

  const secrets = require('secrets.js-grempe')
  , fs = require('fs')
  , path = require('path')
  , { generateHeader, encrypt } = require('./commons');

  let key = secrets.random(128) // To get 32 byte
  , KeyFragment = secrets.share(key, this.parts, this.threshold)
  , file = fs.readFileSync(this.filename, 'utf8')
  , filename = path.basename(this.filename)
  , ext = path.extname(filename)
  , filenameWithoutExt = filename.split('.'+ext)[0]
  , index = 1
  , horcruxFiles = [];
  for (let i = 0; i < this.parts; i++) {
    let header = {
      OriginalFilename: filename,
      Timestamp: parseInt(Date.now()/1000, 10), // to make it like the original horcrux
      Index: index,
      Total: this.parts,
      KeyFragment: KeyFragment[i],
      Threshold: this.threshold
    }
    , outFile = `${filenameWithoutExt}_${index}_${this.parts}.horcrux`
    , fileHeader = generateHeader(this.parts, index, header);

    fs.writeFile(path.join(this.output, outFile), fileHeader, (err) => {
      if (err) throw err;
    });
    horcruxFiles.push(path.join(this.output, outFile))
    index++;
  }
  let fileReader = fs.readFileSync(this.filename, 'utf8')
  , reader = encrypt(fileReader, key)
  , from = 0
  , to = parseInt(reader.length / this.parts, 10);
  for (let i in horcruxFiles) {
    fs.appendFile(horcruxFiles[i], reader.slice(from, to), (err) => {
      if (err) throw err;
    });
    from = to + 1;
    if (i != horcruxFiles.length) to = to + parseInt(reader.length / this.parts, 10);
    else to = reader.length;
  }
};

Horcrux.prototype.bind = function (output) {
  if (output) {
    console.log('Binding to:', output);
  } else {
    console.log('Binding:', this.output)

  }
}

module.exports = Horcrux;
