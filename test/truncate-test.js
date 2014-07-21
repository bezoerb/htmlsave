/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2014 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */
'use strict';
/*jshint -W098 */
/* global describe, it, before, grunt */
var truncate = require('../src/modules/truncate.js'),
    utils = require('../src/modules/utils.js'),
    HTMLHint  = typeof HTMLHint === 'undefined' ? require("htmlhint").HTMLHint : false,
    expect = require('chai').expect,
    assert = require('chai').assert;




/*
 Tests for truncate
 */
describe('truncate', function() {

    var text = '<p>Lorem ipsum <a href="#">dolor sit amet</a>, conset<span>etur sadipscing elitr, sed</span>diam <div>nonumy eirmod</div>tempor invidunt ut labore et dolore magna aliquyam</p>';


    /**
     * Truncate string after specified word + offset
     * do basic tests on result
     *
     * @param word
     * @param offset
     * @returns {*}
     */
    function getResultForWord(word, offset,options) {
        var result,length, messages,
            maxLength = utils.stripTags(text).indexOf(word) + word.length;

        if (offset) {
            maxLength += parseInt(offset,10);
        }

        result = truncate(text,maxLength,options);

        messages = HTMLHint ? HTMLHint.verify(result, {'tag-pair': true}) : [];
        length = utils.stripTags(result).length;


        expect(messages.length).to.equals(0,messages.length ? 'Htmlhint errors found: ' + messages[0].message : '');
        expect(length).to.be.at.most(maxLength);

        return result;
    }

    it('should truncate with ellipsis', function() {
        expect(getResultForWord('sit')).to.equals('<p>Lorem ipsum <a href="#">dolor...</a></p>');
    });

    it('should truncate without ellipsis', function() {
        var result = getResultForWord('sit',0,{ellipsis:false});
        expect(result).to.equals('<p>Lorem ipsum <a href="#">dolor sit</a></p>');
    });

    it('should strip the a tag', function() {
        var result = getResultForWord('ipsum',3);
        expect(result).to.equals('<p>Lorem ipsum...</p>');
    });
    it('should remove whitespace before ellipsis', function() {
        var result = getResultForWord('ipsum',2,{ellipsis:'..'});
        expect(result).to.equals('<p>Lorem ipsum..</p>');
    });
    it('should remove ipsum', function() {
        var result = getResultForWord('ipsum',2,{ellipsis:'...'});
        expect(result).to.equals('<p>Lorem...</p>');
    });

    it('should strip the a tag', function() {
        var result = getResultForWord('ipsum', 3, {breakword: true});
        expect(result).to.equals('<p>Lorem ipsum...</p>');
    });

    it('should strip the a tag', function() {
        var result = getResultForWord('ipsum', 0, {breakword: true});
        expect(result).to.equals('<p>Lorem ip...</p>');
    });
});