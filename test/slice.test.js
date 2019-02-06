/* eslint-env es6, browser */
describe('Slice', function() {
  it('is available', function() {
    expect(htmlsave.slice).toBeDefined();
  });

  it('slice normal content disabled breakword', function() {
    var options = {breakword: false};
    var str = '<a href="#content">This is a link to my content</a>';
    var parts = htmlsave.slice(str, 0, options);

    expect(parts.length).toEqual(7);
    expect(parts[0]).toEqual('<a href="#content">This </a>');
    expect(parts[1]).toEqual('<a href="#content">is </a>');
    expect(parts[2]).toEqual('<a href="#content">a </a>');
    expect(parts[3]).toEqual('<a href="#content">link </a>');
    expect(parts[4]).toEqual('<a href="#content">to </a>');
    expect(parts[5]).toEqual('<a href="#content">my </a>');
    expect(parts[6]).toEqual('<a href="#content">content</a>');
  });

  it('split text in three parts disabled breakword', function() {
    var options = {breakword: false};
    var str = '<a href="#content">This is a link to my content</a>';
    var parts = htmlsave.slice(str, 13, options);

    expect(parts.length, 3);
    expect(parts[0]).toEqual('<a href="#content">This is a </a>');
    expect(parts[1]).toEqual('<a href="#content">link to my </a>');
    expect(parts[2]).toEqual('<a href="#content">content</a>');
  });

  it('slice the string in 3 parts', function() {
    var str = '123456789';
    var parts = htmlsave.slice(str, 3);

    expect(parts.length).toEqual(3);
    expect(parts[0]).toEqual('123');
    expect(parts[1]).toEqual('456');
    expect(parts[2]).toEqual('789');
  });

  it('add missing tags', function() {
    var str = '<a href="#content">This is a link to my content</a>';
    var parts = htmlsave.slice(str, 14);

    expect(parts.length).toEqual(2);
    expect(parts[0]).toEqual('<a href="#content">This is a link</a>');
    expect(parts[1]).toEqual('<a href="#content"> to my content</a>');
  });

  it('add more missing tags', function() {
    var str2 = '<div><a href="#content">This is a link to my content</a></div><span>Test</span>';
    var parts2 = htmlsave.slice(str2, 14);

    expect(parts2.length).toEqual(3);
    expect(parts2[0]).toEqual('<div><a href="#content">This is a link</a></div>');
    expect(parts2[1]).toEqual('<div><a href="#content"> to my content</a></div>');
    expect(parts2[2]).toEqual('<span>Test</span>');
  });

  it('do nothing', function() {
    var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>';
    var parts = htmlsave.slice(str, 6);

    expect(parts.length).toEqual(1);
    expect(parts[0]).toEqual('<p><span><ul><li>abc</li><li>def</li></ul></span></p>');
  });

  it('add missing tags', function() {
    var str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>';
    var parts = htmlsave.slice(str, 3);

    expect(parts.length).toEqual(2);
    expect(parts[0]).toEqual('<p><span><ul><li>abc</li></ul></span></p>');
    expect(parts[1]).toEqual('<p><span><ul><li>def</li></ul></span></p>');
  });

  it('handle void elements', function() {
    var str2 = '<a href="#content">This is a link<br/>to my contents</a><span>Test</span>';
    var parts2 = htmlsave.slice(str2, 14, {breakword: false});

    expect(parts2.length).toEqual(3);
    expect(parts2[0]).toEqual('<a href="#content">This is a link<br/></a>');
    expect(parts2[1]).toEqual('<a href="#content">to my </a>');
    expect(parts2[2]).toEqual('<a href="#content">contents</a><span>Test</span>');
  });

  it('different lengths', function() {
    var str = '<a href="#content">This is a link to my content</a>';
    var parts = htmlsave.slice(str, [1, 2, 5, 7]);

    expect(parts.length).toEqual(6);
    expect(parts[0], '<a href="#content">T</a>');
    expect(parts[1], '<a href="#content">hi</a>');
    expect(parts[2], '<a href="#content">s is </a>');
    expect(parts[3], '<a href="#content">a link </a>');
    expect(parts[4], '<a href="#content">to my c</a>');
    expect(parts[5], '<a href="#content">ontent</a>');
  });
});
