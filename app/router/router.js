var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var controller = require('../controller/controller');
var model1 = require('../model/model1');
const multer = require('multer');
const path = require('path');
/*
router.get('/', controller.login);
router.post('/', controller.loginHandler);
router.get('/regist', controller.registPage);
router.post('/regist', controller.register);
router.post('/logout', controller.logout);
router.get('*', controller.redirecter);
*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('../public/uploads/' + req.session.username));
  },
  filename: async function (req, file, cb) {
  	var curUser = await model1.find('username', req.session.username);
  	var num = curUser.photosNum + 1;
    cb(null, req.session.username + num.toString() + '.jpg');
    await model1.addNewPhotos(curUser.username, num);
  }
});
const upload = multer({storage: storage});
router.post('/photos',upload.single('avatar'), controller.photoHandler);
router.get('/', controller.logIn);
router.post('/', controller.loginHandler);
router.get('/signup', controller.signup);
router.post('/signup', controller.signupHandler);
router.get('/*', controller.userHome);
router.post('/*', controller.userHandler);
//router.get('/logout', controller.logout);
//router.get('*', controller.redirecter);

module.exports = router;