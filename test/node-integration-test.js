"use strict";
/* global describe,it */

var expect = require('chai').expect;

describe("htmlsave included via node", function () {
    it("is included successfully", function () {
        var htmlsave = require('../src/htmlsave');
        expect(htmlsave).not.to.equals(undefined);
        expect(htmlsave).to.include.keys('truncate');
        expect(htmlsave).to.include.keys('slice');

    });

    it("slices in 3 parts", function () {
        var parts = require('../src/htmlsave').slice('123456789',3);
        expect(parts.length).to.equals(3);
    });

    it("truncates to 5+ellipsis", function () {
        var truncated = require('../src/htmlsave').truncate('yo node',6,{breakword:false});

        expect(truncated.length).to.equals(5);
    });
});