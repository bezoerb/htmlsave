"use strict";
/* global define,describe,it,expect */
define(['../lib/htmlsave'],function(htmlsave) {

	describe('Dummy Test',function(){
		it('htmlsave.split is function', function () {
			expect(typeof htmlsave.split).toBe('function');
		});
	});
});
