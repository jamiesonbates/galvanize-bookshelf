/* eslint-disable */

'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

const { camelizeKeys, decamelizeKeys } = require('humps');

// Read All Books
router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((books) => {
      res.send(camelizeKeys(books));
    })
    .catch((err) => {
      next(err);
    });
});

// Read One Books
router.get('/books/:id', (req, res, next) => {
  if (!Number.parseFloat(req.params.id)) {
    return next();
  }

  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }
      console.log(book);

      // res.set('Content-Type', 'application/json')
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  if (!req.body.title || !req.body.author || !req.body.genre || !req.body.description || !req.body.coverUrl) {
    const err = new Error(400);

    console.error(err.stack);

    throw err;
  }

  return knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl
    }, '*')
    .then((book) => {
      res.send(camelizeKeys(book[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  if (!Number.parseFloat(req.params.id) || !req.params.body) {
    return next();
  }
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      return knex('books')
        .update({
          title: req.body.title,
          author: req.body.author,
          genre: req.body.genre,
          description: req.body.description,
          cover_url: req.body.coverUrl
        }, '*')
        .where('id', req.params.id);
    })
    .then((book) => {
      res.send(camelizeKeys(book[0]));
    })
    .catch((err) => {
      next(err);
    })
});

router.delete('/books/:id', (req, res, next) => {
  if (!Number.parseFloat(req.params.id) || !req.params.body) {
    return next();
  }

  let book;

  knex('books')
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        return next();
      }

      book = row;

      return knex('books')
        .del()
        .where('id', req.params.id);
    })
    .then(() => {
      delete book.id;
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
