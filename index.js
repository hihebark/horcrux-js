console.log('[ horcrux-js ]');
const Horcrux = require('./horcrux');

let horcrux = new Horcrux({
  filename: 'package.json',
  output: './test',
  parts: 5,
  threshold: 5
});

horcrux.split();
//horcrux.bind();
