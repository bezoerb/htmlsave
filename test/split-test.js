"use strict";
/* global define,describe,it,expect */
define(['../lib/htmlsave'],function(htmlsave) {

	describe('Existance Test',function(){
		it('htmlsave.split is function', function () {
			expect(typeof htmlsave.split).toBe('function');
		});
	});

	describe('Split normal content with breakword',function(){
		it('should split the string in 3 parts', function () {
			var str = '123456789',
				parts = htmlsave.split(str,3);

			expect(parts.length).toBe(3);
			expect(parts[0]).toBe('123');
			expect(parts[1]).toBe('456');
			expect(parts[2]).toBe('789');
		});
	});

	describe('Split normal content without breaking words',function(){
		it('should split the string in 3 parts', function () {
			var str = '123 4567 89',
				parts = htmlsave.split(str,3,{
					breakword: false
				});

			expect(parts.length).toBe(3);
			expect(parts[0]).toBe('123');
			expect(parts[1]).toBe(' 4567');
			expect(parts[2]).toBe(' 89');
		});
	});

	describe('split html text',function(){
		it('should add missing tags', function () {
			var str = '<a href="#content">This is a link to my content</a>',
				parts = htmlsave.split(str,14);

			expect(parts.length).toBe(2);
			expect(parts[0]).toBe('<a href="#content">This is a link</a>');
			expect(parts[1]).toBe('<a href="#content"> to my content</a>');
		});

		it('should add more missing tags', function () {
			var str2 = '<a href="#content">This is a link to my content</a><span>Test</span>',
				parts2 = htmlsave.split(str2,14);

			expect(parts2.length).toBe(3);
			expect(parts2[0]).toBe('<a href="#content">This is a link</a>');
			expect(parts2[1]).toBe('<a href="#content"> to my content</a>');
			expect(parts2[2]).toBe('<span>Test</span>');
		});
	});


	describe('html text with many tags',function(){
		it('should do nothing', function () {
			var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>',
				parts = htmlsave.split(str,6);

			expect(parts.length).toBe(1);
			expect(parts[0]).toBe('<p><span><ul><li>abc</li><li>def</li></ul></span></p>');
		});

		it('should add missing tags', function () {
			var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>',
				parts = htmlsave.split(str,3);

			expect(parts.length).toBe(2);
			expect(parts[0]).toBe('<p><span><ul><li>abc</li></ul></span></p>');
			expect(parts[1]).toBe('<p><span><ul><li>def</li></ul></span></p>');

		});
	});
});
