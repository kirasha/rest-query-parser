'use strict';

var should = require('should');
var restQueryParser = require('..');
var express = require('express');
var request = require('supertest');

var app = express();
app.use(restQueryParser());
app.get('/', function (req, res) {
  res.json(req.restQuery);
});

describe('RestQueryParser', function () {
  it('should expose a function', function (done) {
    'function'.should.equal(typeof restQueryParser);
    done();
  });

  describe('defaults ', function () {
    it('should expose a restQuery object on the request', function (done) {
      request(app)
      .get('/')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        done();
      });
    });

    it('should return empty values if no parameter is given', function (done) {
      request(app)
      .get('/')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.body.should.be.empty();
        done();
      });
    });

  });

  describe('properties', function () {

    describe('fields', function () {
      it('should  be able to parse fields', function (done) {
        request(app)
        .get('/?fields=username, email, name, createdOn, role.name')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.fields.should.be.Array();
          res.body.fields.length.should.equal(5);
          done();
        });
      });
    });

    describe('pagination', function () {
      it('should  be able to parse pagination', function (done) {
        request(app)
        .get('/?page=2&size=10')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          should.exist(res.body.pagination);
          res.body.pagination.should.be.Object();
          res.body.pagination.should.have.properties(['page', 'size']);
          res.body.pagination.page.should.equal(2);
          res.body.pagination.size.should.equal(10);
          done();
        });
      });

      it('should  be able to parse pagination when given on object url', function (done) {
        request(app)
        .get('/?pagination[page]=2&pagination[size]=10')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          should.exist(res.body.pagination);
          res.body.pagination.should.be.Object();
          res.body.pagination.should.have.properties(['page', 'size']);
          res.body.pagination.page.should.equal(2);
          res.body.pagination.size.should.equal(10);
          done();
        });
      });
    });

    describe('embeded', function () {
      it('should be able to parse embeded fields', function (done) {
        request(app)
        .get('/?embed=role, permissions.name')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.embed.should.be.Array();
          res.body.embed.length.should.equal(2);
          done();
        });
      });
    });

    describe('sorting', function () {
      it('Should be able to parse sort field', function (done) {
        request(app)
        .get('/?sort=name,-dateCreation')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.sort.length.should.equal(2);
          var nameSort = res.body.sort[0];
          var dateSort = res.body.sort[1];
          nameSort.should.have.property('name');
          nameSort.name.should.equal('asc');
          dateSort.should.have.property('dateCreation');
          dateSort.dateCreation.should.equal('desc');
          done();
        });
      });

      it('Should be able to parse sorting field as object', function (done) {
        request(app)
        .get('/?sort[name]=asc&sort[dateCreation]=desc')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.sort.length.should.equal(2);
          var nameSort = res.body.sort[0];
          var dateSort = res.body.sort[1];
          nameSort.should.have.property('name');
          nameSort.name.should.equal('asc');
          dateSort.should.have.property('dateCreation');
          dateSort.dateCreation.should.equal('desc');
          done();
        });
      });

    });

    describe('filters', function () {
      it('should filter on == sign', function (done) {
        request(app)
        .get('/?filters=name==John')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('name');
          filter.value.should.equal('John');
          filter.operator.should.equal('==');
          done();
        });
      });

      it('should filter on != sign', function (done) {
        request(app)
        .get('/?filters=name!=John')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('name');
          filter.value.should.equal('John');
          filter.operator.should.equal('!=');
          done();
        });
      });

      it('should filter on ~ sign', function (done) {
        request(app)
        .get('/?filters=name~John')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('name');
          filter.value.should.equal('John');
          filter.operator.should.equal('~');
          done();
        });
      });

      it('should filter on !~ sign', function (done) {
        request(app)
        .get('/?filters=name!~John')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('name');
          filter.value.should.equal('John');
          filter.operator.should.equal('!~');
          done();
        });
      });

      it('should filter on < sign', function (done) {
        request(app)
        .get('/?filters=age<20')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.equal(20);
          filter.operator.should.equal('<');
          done();
        });
      });

      it('should filter on <= sign', function (done) {
        request(app)
        .get('/?filters=age<=20')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.equal(20);
          filter.operator.should.equal('<=');
          done();
        });
      });

      it('should filter on > sign', function (done) {
        request(app)
        .get('/?filters=age>20')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.equal(20);
          filter.operator.should.equal('>');
          done();
        });
      });

      it('should filter on >= sign', function (done) {
        request(app)
        .get('/?filters=age>=20')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.equal(20);
          filter.operator.should.equal('>=');
          done();
        });
      });

      it('should filter on "in []" sign', function (done) {
        request(app)
        .get('/?filters=age[20,25,30]')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.containDeep([20,25,30]);
          filter.operator.should.equal('in');
          done();
        });
      });

      it('should filter on "not in ][" sign', function (done) {
        request(app)
        .get('/?filters=age]20,25,30[')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.containDeep([20,25,30]);
          filter.operator.should.equal('not in');
          done();
        });
      });

      it('should filter on "between []" sign', function (done) {
        request(app)
        .get('/?filters=age[20-30]')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.containDeep([20,30]);
          filter.operator.should.equal('between');
          done();
        });
      });

      it('should filter on "not between []" sign', function (done) {
        request(app)
        .get('/?filters=age]20-30[')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(1);
          var filter = res.body.filters[0];
          filter.key.should.equal('age');
          filter.value.should.containDeep([20,30]);
          filter.operator.should.equal('not between');
          done();
        });
      });

      it('should filter on multiple filters sign', function (done) {
        request(app)
        .get('/?filters=name~Jean;post<10;points[20-30]')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.filters.length.should.equal(3);
          var filter1 = res.body.filters[0];
          filter1.key.should.equal('name');
          filter1.value.should.equal('Jean');
          filter1.operator.should.equal('~');
          var filter2 = res.body.filters[1];
          filter2.key.should.equal('post');
          filter2.value.should.equal(10);
          filter2.operator.should.equal('<');
          var filter3 = res.body.filters[2];
          filter3.key.should.equal('points');
          filter3.value.should.containDeep([20,30]);
          filter3.operator.should.equal('between');
          done();
        });
      });
    });

    describe('Multiple params', function () {
      it('should parse multiple params', function (done) {
        request(app)
        .get('/?fields=name,username,age&filters=name~Jean;post<10;points[20-30]&page=1&size=5&sort=name,-age&embed=permissions')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.body.fields.should.be.Array();
          res.body.fields.length.should.equal(3);
          res.body.filters.length.should.equal(3);
          var filter1 = res.body.filters[0];
          filter1.key.should.equal('name');
          filter1.value.should.equal('Jean');
          filter1.operator.should.equal('~');
          var filter2 = res.body.filters[1];
          filter2.key.should.equal('post');
          filter2.value.should.equal(10);
          filter2.operator.should.equal('<');
          var filter3 = res.body.filters[2];
          filter3.key.should.equal('points');
          filter3.value.should.containDeep([20,30]);
          filter3.operator.should.equal('between');
          res.body.pagination.should.be.Object();
          res.body.pagination.should.have.properties(['page', 'size']);
          res.body.pagination.page.should.equal(1);
          res.body.pagination.size.should.equal(5);
          res.body.sort.length.should.equal(2);
          var nameSort = res.body.sort[0];
          var ageSort = res.body.sort[1];
          nameSort.should.have.property('name');
          nameSort.name.should.equal('asc');
          ageSort.should.have.property('age');
          ageSort.age.should.equal('desc');
          res.body.embed.should.be.Array();
          res.body.embed.length.should.equal(1);
          done();
        });
      });
    });

  });

});
