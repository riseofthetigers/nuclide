'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var invariant = require('assert');

function debounce(
  func: (...varargs: Array<any>) => void,
  wait: number,
  immediate: boolean,
): () => void {
  // Taken from: https://github.com/jashkenas/underscore/blob/b10b2e6d72/underscore.js#L815.
  var timeout;
  var args: ?Array<any>;
  var context;
  var timestamp = 0;
  var result;

  var later = function() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        invariant(args);
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function() {
    context = this; // eslint-disable-line consistent-this
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

module.exports = debounce;
