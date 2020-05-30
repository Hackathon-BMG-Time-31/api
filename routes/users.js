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
router.post("/cadastro", function (req, res) {
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
    if (err){
      res
          .status(400)
          .send({ auth: falso, message: "Erro no cadastro", token: null });
    }else{
      res
          .status(200)
          .send({ auth: true, message: "Cadastro realizado com sucesso", token: null });
    }
  });
});

router.post("/login", function (req, res) {
  User.getUserByCpf(req.body.cpf, function (err, user) {
    console.log(user)
    if (!user) {
      res
          .status(400)
          .send({ auth: false, message: "Usuário não encontrado", token: null });
    }else {

      User.comparePassword(req.body.senha, user.senha, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          const userRetorno = {
            'nome': user.nome,
            'email': user.email,
            'id': user._id,
            'data_nascimento': user.data_nascimento
          };
          const token = jwt.sign(userRetorno, privateKeyJWT, {
            expiresIn: expiresTimeJWT,
          });
          res
            .status(200)
            .send({ auth: true, message: "Login realizado com sucesso", token: token });
        } else {
          res
            .status(400)
            .send({ auth: false, message: "Senha invalida", token: null });
        }
      });
    }
  });
});

module.exports = router;
