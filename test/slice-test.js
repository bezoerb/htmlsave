"use strict";
/* global define,describe,it,expect */
define(['../lib/htmlsave'],function(htmlsave) {

	describe('Existance Test',function(){
		it('htmlsave.slice is function', function () {
			expect(typeof htmlsave.slice).toBe('function');
		});
	});

	describe('slice text',function(){
		var options = {breakword:false};

		it('should split text to seperate words', function () {
			var str = '<a href="#content">This is a link to my content</a>',
				parts = htmlsave.slice(str,0,options);

			expect(parts.length).toBe(7);
			expect(parts[0]).toBe('<a href="#content">This </a>');
			expect(parts[1]).toBe('<a href="#content">is </a>');
			expect(parts[2]).toBe('<a href="#content">a </a>');
			expect(parts[3]).toBe('<a href="#content">link </a>');
			expect(parts[4]).toBe('<a href="#content">to </a>');
			expect(parts[5]).toBe('<a href="#content">my </a>');
			expect(parts[6]).toBe('<a href="#content">content</a>');
		});


		it('should split text in three parts', function () {
			var str = '<a href="#content">This is a link to my content</a>',
				parts = htmlsave.slice(str,13,options);

			expect(parts.length).toBe(3);
			expect(parts[0]).toBe('<a href="#content">This is a </a>');
			expect(parts[1]).toBe('<a href="#content">link to my </a>');
			expect(parts[2]).toBe('<a href="#content">content</a>');
		});

	});


	describe('slice normal content with breakword',function(){
		it('should slice the string in 3 parts', function () {
			var str = '123456789',
				parts = htmlsave.slice(str,3);

			expect(parts.length).toBe(3);
			expect(parts[0]).toBe('123');
			expect(parts[1]).toBe('456');
			expect(parts[2]).toBe('789');
		});
	});

	describe('slice normal content without breaking words',function(){
		it('should slice the string in 3 parts', function () {
			var str = '123 4567 89',
				parts = htmlsave.slice(str,3,{
					breakword: false
				});

			expect(parts.length).toBe(3);
			expect(parts[0]).toBe('123 ');
			expect(parts[1]).toBe('4567 ');
			expect(parts[2]).toBe('89');
		});
	});

	describe('slice html text',function(){
		it('should add missing tags', function () {
			var str = '<a href="#content">This is a link to my content</a>',
				parts = htmlsave.slice(str,14);

			expect(parts.length).toBe(2);
			expect(parts[0]).toBe('<a href="#content">This is a link</a>');
			expect(parts[1]).toBe('<a href="#content"> to my content</a>');
		});

		it('should add more missing tags', function () {
			var str2 = '<a href="#content">This is a link to my content</a><span>Test</span>',
				parts2 = htmlsave.slice(str2,14);

			expect(parts2.length).toBe(3);
			expect(parts2[0]).toBe('<a href="#content">This is a link</a>');
			expect(parts2[1]).toBe('<a href="#content"> to my content</a>');
			expect(parts2[2]).toBe('<span>Test</span>');
		});
	});


	describe('html text with many tags',function(){
		it('should do nothing', function () {
			var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>',
				parts = htmlsave.slice(str,6);

			expect(parts.length).toBe(1);
			expect(parts[0]).toBe('<p><span><ul><li>abc</li><li>def</li></ul></span></p>');
		});

		it('should add missing tags', function () {
			var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>',
				parts = htmlsave.slice(str,3);

			expect(parts.length).toBe(2);
			expect(parts[0]).toBe('<p><span><ul><li>abc</li></ul></span></p>');
			expect(parts[1]).toBe('<p><span><ul><li>def</li></ul></span></p>');

		});
	});
});
