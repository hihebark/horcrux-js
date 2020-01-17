# Horcrux-js

The project is a clone of [horcrux](https://github.com/jesseduffield/horcrux) by [jesseduffield](https://github.com/jesseduffield) written with golang.
As said in the readme of horcrux you can split your file into encrypted horcruxes so that you don't need to remember a passcode.

## Usage

```js
const Horcrux = require('horcrux-js');

const horcrux = new Horcrux({
  filename: './example/diary.txt',
  output: './example',
  parts: 5,
  threshold: 3
});

horcrux.split((err, horcruxes) => {
  if (err) throw err;
  console.log(horcruxes.join(' / '))
});

horcrux.bind('./example', './example', (err, secret) => {
  if (err) throw err;
  console.log(secret);
});

```
