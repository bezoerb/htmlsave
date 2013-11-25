"use strict";
/* global describe,it,expect */
describe("htmlsave included via node", function () {
    it("is included successfully", function () {
        expect(require('../lib/htmlsave')).not.toBeUndefined();
    });

    it("slices in 3 parts", function () {
        var parts = require('../lib/htmlsave').slice('123456789',3);
		expect(parts.length).toBe(3);
    });

    it("truncates to 5+ellipsis", function () {
        var truncated = require('../lib/htmlsave').truncate('yo node',6,{breakword:false});

        expect(truncated.length).toBe(5);
    });
});