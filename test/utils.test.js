/* eslint-env es6, browser */

var text =
  '<p>Lorem ipsum <a href="#">dolor sit amet</a>, conset<span>etur sadipscing elitr, sed</span>diam <div>nonumy eirmod</div>tempor invidunt ut labore et dolore magna aliquyam</p>';

/**
 * Offset helper
 *
 * @param word
 * @param offset
 * @returns {*}
 */
var offsetAfter = function(word, offset) {
  return text.indexOf(word) + (offset || 0) + word.length;
};

describe('Utils', function() {
  describe('CanSplit', function() {
    it('allow splitting after whitespace', function() {
      expect(htmlsave.utils.canSplit(text, text.indexOf(' ') + 1)).toBeTruthy();
    });
    it('disallow splitting on 1st character', function() {
      expect(htmlsave.utils.canSplit(text, 0)).toBeFalsy();
    });
    it('disallow splitting after last character', function() {
      expect(htmlsave.utils.canSplit(text, text.length)).toBeFalsy();
    });
    it('allow splitting right before/after block element', function() {
      var indexBefore = text.indexOf('<div>');
      var indexAfter = text.indexOf('</div>') + 6;
      expect(htmlsave.utils.canSplit(text, indexBefore)).toBeTruthy();
      expect(htmlsave.utils.canSplit(text, indexAfter)).toBeTruthy();
    });
    it('disallow splitting right before/after inline element', function() {
      var indexBefore = text.indexOf('<span>');
      var indexAfter = text.indexOf('</span>') + 7;
      expect(htmlsave.utils.canSplit(text, indexBefore)).toBeFalsy();
      expect(htmlsave.utils.canSplit(text, indexAfter)).toBeFalsy();
    });
    it('disallow splitting inside word', function() {
      var index = text.indexOf('Lorem') + 3;
      expect(htmlsave.utils.canSplit(text, index)).toBeFalsy();
    });
    it('disallow splitting inside tag', function() {
      var index = text.indexOf('<span>') - 3;
      expect(htmlsave.utils.canSplit(text, index)).toBeFalsy();
    });
    it('disallow splitting before inline tag', function() {
      var str = 'a<span></span>a';
      expect(htmlsave.utils.canSplit(str, 1)).toBeFalsy();
    });
    it('disallow splitting after inline tag', function() {
      var str = 'a<span></span>a';
      expect(htmlsave.utils.canSplit(str, str.length - 1)).toBeFalsy();
    });
    it('allow splitting before block tag', function() {
      var str = 'b<div></div>b';
      expect(htmlsave.utils.canSplit(str, 1)).toBeTruthy();
    });
    it('allow splitting after block tag', function() {
      var str = 'b<div></div>b';
      expect(htmlsave.utils.canSplit(str, str.length - 1)).toBeTruthy();
    });
    it('allow split before br', function() {
      var str = '<a href="#content">This is a link<br/>to my contents</a>';
      expect(htmlsave.utils.canSplit(str, str.indexOf('<br/>'))).toBeTruthy();
    });
    it('allow split after br', function() {
      var str = '<br/>to my contents</a><span>Test</span>';
      expect(htmlsave.utils.canSplit(str, 5)).toBeTruthy();
    });
  });
  describe('IsVoidElement', function() {
    it('return false for div', function() {
      expect(htmlsave.utils.isVoidElement('<div>')).toBeFalsy();
    });
    it('return true for img (short tag)', function() {
      expect(htmlsave.utils.isVoidElement('<img src="" />')).toBeTruthy();
    });
    it('return true for img', function() {
      expect(htmlsave.utils.isVoidElement('<img src="">')).toBeTruthy();
    });
  });
  // describe('WhitespacePos', function() {
  //   it('find first ws between lorem and ipsum', function() {
  //     expect(htmlsave.utils.whitespacePos(text, 3)).toEqual(5);
  //   });
  //   it('find div start tag', function() {
  //     expect(htmlsave.utils.whitespacePos(text, offsetAfter('elitr, '))).toEqual(7);
  //   });
  //   it('find pos after dolor', function() {
  //     expect(htmlsave.utils.whitespacePos(text, offsetAfter('a hre'))).toEqual(5);
  //   });
  //   it('allow break direct after the tag is finished', function() {
  //     expect(htmlsave.utils.whitespacePos(text, offsetAfter('</d'))).toEqual(0);
  //   });
  //   it('take first ws inside div container, not after opening div', function() {
  //     expect(htmlsave.utils.whitespacePos(text, offsetAfter('<di'))).toEqual(6);
  //   });
  //   it('take first ws inside div container, not after opening div', function() {
  //     expect(htmlsave.utils.whitespacePos('link<br/>to my contents</a><span>Test</span>')).toEqual(4);
  //   });
  //   it('find whitespace on whitespace', function() {
  //     expect(htmlsave.utils.whitespacePos('    ', 0)).toEqual(0);
  //   });
  //   it('find whitespace on tab', function() {
  //     expect(htmlsave.utils.whitespacePos('\t   ', 0)).toEqual(0);
  //   });
  //   it('find whitespace before br', function() {
  //     expect(htmlsave.utils.whitespacePos('<br/>1 2', 0)).toEqual(0);
  //   });
  //   it('find whitespace when inside br', function() {
  //     expect(htmlsave.utils.whitespacePos('<br/>12 2', 3)).toEqual(0);
  //   });
  //   it('find whitespace string', function() {
  //     expect(htmlsave.utils.whitespacePos('abc def', 0)).toEqual(3);
  //   });
  //   it('handle tag with missing start', function() {
  //     expect(htmlsave.utils.whitespacePos('v class="abc">abc def', 0)).toEqual(3);
  //   });
  // });
  // describe('NextWhitespacePos', function() {
  //   it('next whitespace on whitespace', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('    ', 0)).toEqual(1);
  //   });
  //   it('next whitespace on tab', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('\t   ', 0)).toEqual(1);
  //   });
  //   it('next whitespace before br', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('<br/>12 2', 0)).toEqual(2);
  //   });
  //   it('next whitespace inside br', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('<br/>12 2', 3)).toEqual(2);
  //   });
  //   it('next whitespace string', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('abc def', 0)).toEqual(3);
  //   });
  //   it('next whitespace string', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('<p>12 3456789</p>', 2)).toEqual(2);
  //   });
  //   it('next whitespace string', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('<p>12 3456789</p>', 3)).toEqual(2);
  //   });
  //   it('next whitespace string', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('<p>12 3456789</p>', 5)).toEqual(7);
  //   });
  //   it('next whitespace string', function() {
  //     expect(htmlsave.utils.nextWhitespacePos('<p>12 3456789</p>', 13)).toEqual(0);
  //   });
  // });
  describe('isArray', function() {
    it('{} is no array', function() {
      expect(htmlsave.utils.isArray({})).toBeFalsy();
    });
    it('"no array" is no array', function() {
      expect(htmlsave.utils.isArray('no array')).toBeFalsy();
    });
    it('1 is no array', function() {
      expect(htmlsave.utils.isArray(1)).toBeFalsy();
    });
    it('function noop(){} is no array', function() {
      expect(htmlsave.utils.isArray(function noop() {})).toBeFalsy();
    });
    it('[] is array', function() {
      expect(htmlsave.utils.isArray([])).toBeTruthy();
    });
  });

  describe('Assign', function() {
    it('return the modified target object', function() {
      var target = {};
      var returned = htmlsave.utils.assign(target, {a: 1});
      expect(returned).toEqual(target);
    });
    it('preserve property order', function() {
      var letters = 'abcdefghijklmnopqrst';
      var source = {};
      letters.split('').forEach(function(letter) {
        source[letter] = letter;
      });
      var target = htmlsave.utils.assign({}, source);
      expect(Object.keys(target).join('')).toEqual(letters);
    });
    it('merge multiple objects', function() {
      var source = {};
      var target = htmlsave.utils.assign(source, {a: 1}, {b: 2}, {c: 3});
      expect(target.a).toEqual(1);
      expect(target.b).toEqual(2);
      expect(target.c).toEqual(3);
    });
  });
});
