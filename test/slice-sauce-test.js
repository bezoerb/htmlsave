"use strict";
/* global describe, it */
var slice = slice || require('../src/modules/slice.js'),
    expect = expect || require('chai').expect;


describe('Existance Test', function() {
    it('slice is function', function() {
        expect(typeof slice).to.equals('function');
    });
});

describe('slice text', function() {
    var options = {breakword: false};

    it('should split text to seperate words', function() {
        var str = '<a href="#content">This is a link to my content</a>',
            parts = slice(str, 0, options);

        expect(parts.length).to.equals(7);
        expect(parts[0]).to.equals('<a href="#content">This </a>');
        expect(parts[1]).to.equals('<a href="#content">is </a>');
        expect(parts[2]).to.equals('<a href="#content">a </a>');
        expect(parts[3]).to.equals('<a href="#content">link </a>');
        expect(parts[4]).to.equals('<a href="#content">to </a>');
        expect(parts[5]).to.equals('<a href="#content">my </a>');
        expect(parts[6]).to.equals('<a href="#content">content</a>');
    });


    it('should split text in three parts', function() {
        var str = '<a href="#content">This is a link to my content</a>',
            parts = slice(str, 13, options);

        expect(parts.length).to.equals(3);
        expect(parts[0]).to.equals('<a href="#content">This is a </a>');
        expect(parts[1]).to.equals('<a href="#content">link to my </a>');
        expect(parts[2]).to.equals('<a href="#content">content</a>');
    });

});


describe('slice normal content with breakword', function() {
    it('should slice the string in 3 parts', function() {
        var str = '123456789',
            parts = slice(str, 3);

        expect(parts.length).to.equals(3);
        expect(parts[0]).to.equals('123');
        expect(parts[1]).to.equals('456');
        expect(parts[2]).to.equals('789');
    });
});

describe('slice normal content without breaking words', function() {
    it('should slice the string in 3 parts', function() {
        var str = '123 4567 89',
            parts = slice(str, 3, {
                breakword: false
            });

        expect(parts.length).to.equals(3);
        expect(parts[0]).to.equals('123 ');
        expect(parts[1]).to.equals('4567 ');
        expect(parts[2]).to.equals('89');
    });
});

describe('slice html text', function() {
    it('should add missing tags', function() {
        var str = '<a href="#content">This is a link to my content</a>',
            parts = slice(str, 14);

        expect(parts.length).to.equals(2);
        expect(parts[0]).to.equals('<a href="#content">This is a link</a>');
        expect(parts[1]).to.equals('<a href="#content"> to my content</a>');
    });

    it('should add more missing tags', function() {
        var str2 = '<a href="#content">This is a link to my content</a><span>Test</span>',
            parts2 = slice(str2, 14);

        expect(parts2.length).to.equals(3);
        expect(parts2[0]).to.equals('<a href="#content">This is a link</a>');
        expect(parts2[1]).to.equals('<a href="#content"> to my content</a>');
        expect(parts2[2]).to.equals('<span>Test</span>');
    });
});


describe('html text with many tags', function() {
    it('should do nothing', function() {
        var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>',
            parts = slice(str, 6);

        expect(parts.length).to.equals(1);
        expect(parts[0]).to.equals('<p><span><ul><li>abc</li><li>def</li></ul></span></p>');
    });

    it('should add missing tags', function() {
        var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>',
            parts = slice(str, 3);

        expect(parts.length).to.equals(2);
        expect(parts[0]).to.equals('<p><span><ul><li>abc</li></ul></span></p>');
        expect(parts[1]).to.equals('<p><span><ul><li>def</li></ul></span></p>');

    });
});
