"use strict";
/* global define,describe,it,expect */
define(['../lib/htmlsave'],function(htmlsave) {
	describe('truncate html and preserve words',function(){
		var options = {breakword:false};

		it('should only leave ellipsis', function () {
			var str = '<p>12 3456789</p>',
				res = htmlsave.truncate(str,8,options);

			expect(res).toBe('<p>12...</p>');
		});

		it('should leave <p>hello my...</p>', function () {
			var str = '<p>hello my little pony</p>',
				res = htmlsave.truncate(str,15,options);

			expect(res).toBe('<p>hello my...</p>');
		});

		it('should leave <span>my little...</span>', function () {
			var str = '<span>my little pony inside my house<span>',
				res = htmlsave.truncate(str,15,options);

			expect(res).toBe('<span>my little...</span>');
		});
	});

	


	describe('truncate text',function(){
		it('should only leave ellipsis', function () {
			var str = '123456789',
				res = htmlsave.truncate(str,3);

			expect(res).toBe('...');
		});

		it('should leave 12345...', function () {
			var str = '123456789',
				res = htmlsave.truncate(str,8);

			expect(res).toBe('12345...');
		});

		it('should leave 123456...', function () {
			var str = '123456 789',
				res = htmlsave.truncate(str,10);

			expect(res).toBe('123456...');
		});
	});

	describe('truncate html',function(){
		it('should only leave ellipsis', function () {
			var str = '<p>12 3456789</p>',
				res = htmlsave.truncate(str,3);

			expect(res).toBe('<p>...</p>');
		});

		it('should leave 12 + ellipsis', function () {
			var str = '<p>12 3456789</p>',
				res = htmlsave.truncate(str,5);

			expect(res).toBe('<p>12...</p>');
		});

		it('should leave 12 + ellipsis', function () {
			var str = '<p>12 3456789</p>',
				res = htmlsave.truncate(str,6);

			expect(res).toBe('<p>12...</p>');
		});

		it('should leave 12345...', function () {
			var str = '<p>12345678</p>9',
				res = htmlsave.truncate(str,8);

			expect(res).toBe('<p>12345...</p>');
		});

		it('should leave 123456...', function () {
			var str = '<span>123456 78909876</span>',
				res = htmlsave.truncate(str,10);

			expect(res).toBe('<span>123456...</span>');
		});
	});


});
