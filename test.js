const Horcrux = require('./horcrux');

let diaryBody = require('fs').readFileSync('./example/diary.txt', 'utf8');

const horcrux = new Horcrux({
  filename: './example/diary.txt',
  output: './example',
  parts: 5,
  threshold: 3
});

horcrux.split();

horcrux.bind('./example', './example', (err, secret) => {
  if (err) throw err
  console.log(diaryBody === secret);
});
