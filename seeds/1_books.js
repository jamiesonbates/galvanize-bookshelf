'use strict';

const data = require('../data');

exports.seed = function(knex) {
  return knex('books').del()
    .then(() => {
      return knex('books').insert(data);
    })
    .then(() => {
      return knex.raw(`SELECT setval('books_id_seq', (SELECT MAX(id) FROM books));`);
    });
};
