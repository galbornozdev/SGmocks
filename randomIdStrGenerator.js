// node .\randomIdStrGenerator.js 100

const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStr(size){
  let str = "";
  for (let i = 0; i < size; i++) {
    str += letters[getRandomInt(1, letters.length) - 1]
  }
  return str;
}

const print = process.argv[2];
if (print){
  for (let i = 0; i < print; i++) {
    console.log(randomStr(10))
  }
}



module.exports = { randomStr }
