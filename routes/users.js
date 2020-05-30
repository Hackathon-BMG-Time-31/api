var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
var bluebird = require("bluebird");
var crypto = bluebird.promisifyAll(require("crypto"));
var async = require("async");
var User = require("../models/user");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const settings = require("../credentials.json");
const privateKeyJWT = settings.JWT.Key;
const expiresTimeJWT = settings.JWT.ExpiresTime;

// Register User
router.post("/register", function (req, res) {
  var nome = req.body.nome;
  var email = req.body.email;
  var cpf = req.body.cpf;
  var senha = req.body.senha;
  var rg = req.body.rg;
  var data_nascimento = req.body.data_nascimento;

  var newUser = new User({
    nome: nome,
    email: email,
    cpf: cpf,
    senha: senha,
    rg: rg,
    data_nascimento: data_nascimento,
  });

  User.createUser(newUser, function (err, user) {
    if (err) throw err;
    console.log(user);
  });

  req.flash("success_msg", "You are registered and can now login");

  res.json({
    mensagem: "usuario cadastrado com sucesso",
  });
});

router.post("/login", function (req, res) {
  console.log(req.body.cpf);
  User.getUserByCpf(req.body.cpf, function (err, user) {
    if (err) throw err;
    if (!user) {
      console.log("usuario não encontrado");
    }

    User.comparePassword(req.body.senha, user.senha, function (err, isMatch) {
      if (err) throw err;
      if (isMatch) {
        const userRetorno = {};
        const token = jwt.sign(userRetorno, privateKeyJWT, {
          expiresIn: expiresTimeJWT,
        });
        res
          .status(200)
          .send({ auth: true, message: "Login successfully", token: token });
      } else {
        console.log("invalid password");
      }
    });
  });
});

module.exports = router;
