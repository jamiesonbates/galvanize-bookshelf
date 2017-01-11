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

// Create One Book
router.post('/books', (req, res, next) => {
  const keys = ['Title', 'Author', 'Genre', 'Description', 'Cover URL'];
  const body = [req.body.title, req.body.author, req.body.genre, req.body.description, req.body.coverUrl];

  for (const type of body) {
    if (!type) {
      const err = new Error(`${(keys[body.indexOf(type)])} must not be blank`);

      err.output = {statusCode: 400};

      throw err;
    }
  }
  // const missing = function(type) {
  //   const err = new Error(`${type} must not be blank`);
  //
  //   err.output = {statusCode: 400};
  //
  //   throw err;
  // }
  //
  // if (!req.body.title) {
  //   missing('Title');
  // }
  // else if (!req.body.author) {
  //   missing('Author');
  // }
  // else if (!req.body.genre){
  //   missing('Genre');
  // }
  // else if (!req.body.description) {
  //   missing('Description');
  // }
  // else if (!req.body.coverUrl) {
  //   missing('Cover URL');
  // }

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


// Update One Book
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


// Delete One Book
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
