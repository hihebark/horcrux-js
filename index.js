/**
 * Horcrux:
 * @param {String} options.filename
 * @param {String} options.output
 * @param {Number} options.parts
 * @param {Number} options.threshold
 **/

const secrets = require('secrets.js-grempe')
, fs = require('fs')
, path = require('path');

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

Horcrux.prototype.split = function (cb) {

  const { generateHeader, encrypt } = require('./commons');

  let key = secrets.random(128) // To get 32 byte
  , KeyFragment = secrets.share(key, this.parts, this.threshold)
  , file = fs.readFileSync(this.filename, 'utf8')
  , filename = path.basename(this.filename, path.extname(this.filename))
  , ext = path.extname(filename)
  , filenameWithoutExt = filename.split('.'+ext)[0]
  , index = 1
  , horcruxFiles = []
  , timestamp = parseInt(Date.now()/1000, 10); // to make it like the original horcrux;
  for (let i = 0; i < this.parts; i++) {
    let header = {
      OriginalFilename: path.basename(this.filename),
      Timestamp: timestamp,
      Index: index,
      Total: this.parts,
      KeyFragment: KeyFragment[i],
      Threshold: this.threshold
    }
    , outFile = `${filenameWithoutExt}_${index}_${this.parts}.horcrux`
    , fileHeader = generateHeader(this.parts, index, header);

    fs.writeFile(path.join(this.output, outFile), fileHeader, (err) => {
      if (err) {
        if (cb !== undefined) cb(err, []);
        else throw err;
      }
    });
    horcruxFiles.push(path.join(this.output, outFile))
    index++;
  }
  let fileReader = fs.readFileSync(this.filename, 'utf8')
  , reader = encrypt(fileReader, key);
  for (const horcruxFile of horcruxFiles) {
    fs.appendFile(horcruxFile, reader, (err) => {
      if (err)
        cb(err, []);
    });
  }
  if (cb !== undefined)
    cb(null, horcruxFiles)
  return horcruxFiles;
};

Horcrux.prototype.bind = function (horcruxespath, output, cb) {
  try {
    const { returnHeader, returnBody, decrypt } = require('./commons');
    if (output !== undefined || output !== '') {
      fs.readdir(horcruxespath, async (err, horcruxFiles) => {
        if (err) throw err;
        let headers = []
        , keyFragments = [];
        horcruxFiles = horcruxFiles.filter(v => v.match(/\.horcrux+$/i));
        for (const horcruxFile of horcruxFiles) {
          let header = await returnHeader(path.join(horcruxespath, horcruxFile));
          headers.push(header);
        }

        if (headers.length == 0) {
          throw new Error('No horcruxes in directory');
          return;
        }

        let testTimestamp = headers.filter(v => v.Timestamp == headers[0].Timestamp)
        , testOriginalFilename =  headers.filter(v => v.OriginalFilename == headers[0].OriginalFilename);

        if (testTimestamp.length != headers.length || testOriginalFilename.length != headers.length) {
          throw new Error('All horcruxes in the given directory must have the same original filename and timestamp.');
          return;
        }
        if (headers.length < headers[0].Threshold) {
          throw new Error(`You do not have all the required horcruxes. There are ${headers[0].Threshold} required to resurrect the original file. You only have ${headers.length}`);
          return;
        }
        for (const header of headers) {
          keyFragments.push(header.KeyFragment);
        }
        let key = secrets.combine(keyFragments);
        let body = await returnBody(path.join(horcruxespath, horcruxFiles[0]));
        let plain = await decrypt(body, key);
        let filename = headers[0].OriginalFilename;
        fs.writeFile(path.join(output, filename), plain, (err) => {
          if (err)
            if (cb !== undefined) cb(err);
            else throw err;
        });
        if (cb !== undefined)
          cb(null, plain);
      });
    }
  } catch (err) {
    throw err;
  }
}

module.exports = Horcrux;
