/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2014 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */
var htmlsave = require('./src/htmlsave.js'),
    res, options = {breakword:false};


res = htmlsave.truncate('123456 789', 8);
console.log(res);
