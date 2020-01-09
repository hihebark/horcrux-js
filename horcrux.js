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
  , { generateHeader, cryptoReader } = require('./commons');

  let key = secrets.random(32)
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
      horcruxFiles.push(path.join(this.output, outFile))
    });
    index++;
  }
  console.log(cryptoReader(key));

};

Horcrux.prototype.bind = function (output) {
  if (output) {
    console.log('Binding to:', output);
  } else {
    console.log('Binding:', this.output)
  }
}

module.exports = Horcrux;
