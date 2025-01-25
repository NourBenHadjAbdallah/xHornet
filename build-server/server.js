"use strict";

var _appModulePath = _interopRequireDefault(require("app-module-path"));

var _http = _interopRequireDefault(require("http"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_appModulePath["default"].addPath("".concat(__dirname));

var Api = (0, _express["default"])();

var HTTP = _http["default"].Server(Api);

var corsOptions = {
  origin: 'http://localhost:4000',
  optionsSuccessStatus: 200 // For legacy browser support

}; // Api.post("/upload", (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   console.log(res)
//     const fs = require('fs');
//   fs.writeFile('./public/assets/test.txt', 'fdfsfsfdsfds', function (err) {
//     if (err) throw err;
//     console.log('File is created successfully.');
//   });
//   // const newpath = __dirname + "/assets/";
//   // const file = req.files.file;
//   // const filename = file.name;
//   const content = 'Some content!';
//   // fs.writeFile('assets/test.txt', content, err => {
//   //   if (err) {
//   //     console.error(err);
//   //   }
//   //   // file written successfully
//   // });
// });

Api.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();
});
Api.post('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Content-Type", 'text/xml');
  console.log(req.body);
  res.status(200).send('success!');
  next();
});
Api.get('/', function (req, res) {
  return res.status(200).send('success!');
});
HTTP.listen(4000, function () {
  console.log('listening on *:4000');
});