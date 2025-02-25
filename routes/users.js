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
const validadorCpf = require("validar-cpf");
const validateEmail = require("email-validator");
const settings = require("../credentials.json");
const privateKeyJWT = settings.JWT.Key;
const expiresTimeJWT = settings.JWT.ExpiresTime;

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });
  jwt.verify(token, privateKeyJWT, function (err, decoded) {
    if (err)
      return res
        .status(401)
        .send({ auth: false, message: "Failed to authenticate token." });
    req.userId = decoded.id;
    next();
  });
};

function validation(email, cpf, res) {
  if (!validateEmail.validate(email)) {
    return false;
  }

  if (!validadorCpf(cpf)) {
    return false;
  }
  console.log("aqui");
  User.getUserByEmail(email, function (err, user) {
    if (user) {
      return false;
    }
    console.log("aqui");
    User.getUserByCpf(cpf, function (err, user) {
      if (user) {
        return false;
      }
    });
  });

  return true;
}

// Register User
router.post("/cadastro", function (req, res) {
  var nome = req.body.nome;
  var email = req.body.email;
  var cpf = req.body.cpf.toString();
  if (validation(email, cpf, res)) {
    var senha = req.body.senha;
    var rg = req.body.rg.toString();
    var data_nascimento = req.body.data_nascimento;
    var saldo = 14757.47;
    var comissao = 0.0;
    var metas = [];
    var pontos = 150;
    var produtosAdiquiridos = [];
    var invites = [];
    var refer = req.body.refer;

    if (refer) {
      User.getUserById(refer, function (err, user) {
        if (user) {
          user.saldo = user.saldo + 10;
          user.invites.push({
            nome: nome,
            valor_recebido: 10,
          });
          user.save();
        }
      });
    }

    var newUser = new User({
      nome: nome,
      email: email,
      cpf: cpf,
      senha: senha,
      rg: rg,
      data_nascimento: data_nascimento,
      saldo: saldo,
      comissao: comissao,
      metas: metas,
      pontos: pontos,
      produtosAdiquiridos: produtosAdiquiridos,
      invites: invites,
    });

    User.createUser(newUser, function (err, user) {
      if (err) {
        res
          .status(400)
          .send({ auth: false, message: "Erro no cadastro", token: null });
      } else {
        res.status(200).send({
          auth: true,
          message: "Cadastro realizado com sucesso",
          token: null,
        });
      }
    });
  } else {
    res.status(400).json({ mensagem: "Usuário já cadastrado", sucesso: false });
  }
});

router.get("/get", verifyJWT, function (req, res) {
  const token = req.headers["x-access-token"];
  const user = jwt.verify(token, privateKeyJWT);
  res.json({ user: user });
});

router.post("/login", function (req, res) {
  User.getUserByCpf(req.body.cpf, function (err, user) {
    console.log(user);
    if (!user) {
      res
        .status(400)
        .send({ auth: false, message: "Usuário não encontrado", token: null });
    } else {
      User.comparePassword(req.body.senha, user.senha, function (err, isMatch) {
        if (isMatch) {
          const userRetorno = {
            nome: user.nome,
            email: user.email,
            id: user._id,
            data_nascimento: user.data_nascimento,
            saldo: user.saldo,
            comissao: user.comissao,
            metas: user.metas,
            pontos: user.pontos,
            produtosAdiquiridos: user.produtosAdiquiridos,
            invites: user.invites,
          };
          const token = jwt.sign(userRetorno, privateKeyJWT, {
            expiresIn: expiresTimeJWT,
          });
          res.status(200).send({
            auth: true,
            message: "Login realizado com sucesso",
            token: token,
          });
        } else {
          res
            .status(401)
            .send({ auth: false, message: "Senha invalida", token: null });
        }
      });
    }
  });
});

module.exports = router;
