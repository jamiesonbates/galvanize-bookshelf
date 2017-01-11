/* eslint-disable */

'use strict';

const bcrypt = require('bcrypt-as-promised');
const express = require('express');
const router = express.Router();
const knex = require('../knex');

const {camelizeKeys, decamelizeKeys} = require('humps');

router.post('/users', (req, res, next) => {
  const throwError = function(message, code) {
    const err = new Error(message);

    err.output = {statusCode: code};

    return err;
  }

  if (!req.body.password) {
    throw throwError('Password must be at least 8 characters long', 400);
  }

  if (!req.body.email) {
    throw throwError('Email must not be blank', 400);
  }

  knex('users')
    .select('email')
    .where('email', req.body.email)
    .asCallback((_err, rows) => {
      if (rows[0].email) {
        next(throwError('Email already exists', 400));
      }
    });

  bcrypt.hash(req.body.password, 12)
    .then((hashed_password) => {
      return knex('users')
        .insert({
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: req.body.email,
          hashed_password: hashed_password
          }, '*');
    })
    .then((users) => {
      console.log(users);
      const user = users[0];

      delete user.hashed_password;

      res.send(camelizeKeys(user));
    })
    .catch((err) => {
      // if (err.code === '23505') {
      //   return next(throwError('Email already exists', 400));
      // }

      next(err);
    });
});

module.exports = router;
