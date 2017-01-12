/* eslint-disable */

'use strict';

const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { camelizeKeys } = require('humps');

const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', req.claim.userId)
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/check', authorize, (req, res, next) => {
  if (!Number.parseInt(req.query.bookId)) {
    throw boom.create(400, 'Book ID must be an integer');
  }

  return knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', req.claim.userId)
    .where('books.id', req.query.bookId)
    .first()
    .then((row) => {
      if (!row) {
        return res.send(false);
      }

      res.send(true);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  let favorite;

  if (!Number.parseInt(req.body.bookId)) {
    throw boom.create(400, 'Book ID must be an integer');
  }

  return knex('books')
    .where('books.id', req.body.bookId)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Book not found');
      }

      return knex('favorites')
        .insert([{
          book_id: req.body.bookId,
          user_id: req.claim.userId,
        }], '*');
    })
    .then((rows) => {
      favorite = camelizeKeys(rows[0]);

      res.send(favorite);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  let favorite;

  if (!Number.parseInt(req.body.bookId)) {
    throw boom.create(400, 'Book ID must be an integer');
  }

  return knex('favorites')
    .where('book_id', req.body.bookId)
    .first()
    .then((favorite) => {
      if (!favorite) {
        throw boom.create(404, 'Favorite not found');
      }

      return knex('favorites')
        .del()
        .where('user_id', req.claim.userId)
        .where('book_id', req.body.bookId);
    })
    .then(() => {
      favorite = { bookId: req.body.bookId, userId: req.claim.userId };

      res.send(favorite);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
