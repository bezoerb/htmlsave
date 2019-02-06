/* eslint-env es6, browser */

describe('Truncate', function() {
  it('is available', function() {
    expect(htmlsave.truncate).toBeDefined();
  });

  it('should not add ellipsis', function() {
    var str = '<p>12 3456789</p>';
    expect(htmlsave.truncate(str, 50, {breakword: false})).toEqual(str);
  });

  it('should throw an error if ellipsis length equals maxlength', function() {
    var str = '<p>12 3456789</p>';

    try {
      htmlsave.truncate(str, 3, {ellipsis: '...'});
      expect('NOT REACHED').toEqual(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should throw an error if ellipsis length is greater than maxlength', function() {
    var str = '<p>12 3456789</p>';

    try {
      htmlsave.truncate(str, 1, {ellipsis: '...'});
      expect('NOT REACHED').toEqual(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should return empty string', function() {
    var str = '<p>hello my little pony</p>';

    expect(htmlsave.truncate(str, 0, {breakword: false})).toEqual('');
  });

  it('should truncate ellipsis', function() {
    var str = '<p>12 3456789</p>';

    expect(htmlsave.truncate(str, -3, {breakword: false})).toEqual('<p>12...</p>');
  });

  it('should leave <p></p>', function() {
    var str = '<p>hello my little pony</p>';

    expect(htmlsave.truncate(str, -1, {breakword: false})).toEqual('<p>hello my little...</p>');
  });

  it('should only leave ellipsis', function() {
    var str = '<p>12 3456789</p>';

    expect(htmlsave.truncate(str, 8, {breakword: false})).toEqual('<p>12...</p>');
  });

  it('should leave <p>hello my...</p>', function() {
    var str = '<p>hello my little pony</p>';

    expect(htmlsave.truncate(str, 15, {breakword: false})).toEqual('<p>hello my...</p>');
  });

  it('should leave <span>my little...</span>', function() {
    var str = '<span>my little pony inside my house<span>';

    expect(htmlsave.truncate(str, 15, {breakword: false})).toEqual('<span>my little...</span>');
  });

  it('should return string 123456...', function() {
    var str = '123456 789';

    expect(htmlsave.truncate(str, 10, {breakword: true})).toEqual(str);
  });

  it('should leave 123456...', function() {
    var str = '123456 789';

    expect(htmlsave.truncate(str, 9, {breakword: true})).toEqual('123456...');
  });

  it('should leave 12 + ellipsis', function() {
    var str = '<p>12 3456789</p>';

    expect(htmlsave.truncate(str, 5, {breakword: true})).toEqual('<p>12...</p>');
  });

  it('should leave 12 + ellipsis', function() {
    var str = '<p>12 3456789</p>';

    expect(htmlsave.truncate(str, 6, {breakword: true})).toEqual('<p>12...</p>');
  });

  it('should leave 12345...', function() {
    var str = '<p>12345678</p>9';

    expect(htmlsave.truncate(str, 8, {breakword: true})).toEqual('<p>12345...</p>');
  });

  it('should leave 123456...', function() {
    var str = '<span>123456 78909876</span>';

    expect(htmlsave.truncate(str, 10, {breakword: false})).toEqual('<span>123456...</span>');
  });

  it('should handle void elements', function() {
    var str = '<span>123<br/>456<br/>78909876</span>';

    expect(htmlsave.truncate(str, 10, {breakword: false})).toEqual('<span>123<br/>456...</span>');
  });

  it('keep tag structure', function() {
    var str = '<div><div><a href="#">Test</a> <span>oder noch was</span></div></div>';
    expect(htmlsave.truncate(str, 14, {breakword: false})).toEqual(
      '<div><div><a href="#">Test</a> <span>oder...</span></div></div>'
    );
  });

  it('drop too long text', function() {
    var str = 'abcdefghijklmnopqrstuvwxyz';
    expect(htmlsave.truncate(str, 10, {breakword: false})).toEqual('...');
  });

  it('drop too long text and keep tags', function() {
    var str = '<a href="#">abcdefghijklmnopqrstuvwxyz</a>';
    expect(htmlsave.truncate(str, 10, {breakword: false})).toEqual('<a href="#">...</a>');
  });

  it("don't truncate if it's not needed", function() {
    var str =
      'this text has 370 characters and we are truncating to 420 sensory claymore mine free-market camera Chiba jeans engine denim tube alcohol. weathered knife papier-mache artisanal corporation boy augmented reality footage otaku table modem digital city dome film boat camera car uplink beef noodles render-farm nodal point wonton soup man hotdog RAF skyscraper market human';
    expect(htmlsave.truncate(str, 420)).toEqual(str);
  });
});
