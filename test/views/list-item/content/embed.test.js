'use strict';

/**
 * Dependencies
 */

const ContentViewEmbed = require('../../../../lib/views/list-item/content/embed');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

describe('<ContentViewEmbed>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();
    this.itemData = {
      embed: { width: 300, height: 300 }
    };

    this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.itemData}/>);
    this.instance = this.wrapper.instance();
  });

  describe('expanded', function() {
    beforeEach(function() {
      this.wrapper.setProps({
        expanded: true
      });
    });

    it('enables pointer-events', function() {
      assert.equal(this.wrapper.props().pointerEvents, 'auto');
    });
  });

  describe('contracted', function() {
    beforeEach(function() {
      this.wrapper.setProps({
        expanded: false
      });
    });

    it('disabled pointer-events', function() {
      assert.equal(this.wrapper.props().pointerEvents, 'none');
    });
  });

  describe('source', function() {
    describe('iframe simple', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: '<iframe src="http://mozilla.org"/>'
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('extracts the src from the iframe', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert.equal(source.uri, 'http://mozilla.org');
      });
    });

    describe('iframe with other attrs', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: '<iframe width="480" height="270" src="https://www.youtube.com/embed/ojcNcvb1olg?feature=oembed" frameborder="0" allowfullscreen></iframe>'
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('extracts the src from the iframe', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert.equal(source.uri, 'https://www.youtube.com/embed/ojcNcvb1olg?feature=oembed');
      });
    });

    describe('iframe single quotes', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: "<iframe src='http://mozilla.org'/>"
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('extracts the src from the iframe', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert.equal(source.uri, 'http://mozilla.org');
      });
    });

    describe('iframe data-magnet-required', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: '<iframe data-magnet-required src="http://mozilla.org"/>'
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('preserves the iframe', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert(/iframe data-magnet-required/.test(source.html));
      });
    });

    describe('simple html', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: '<h1>hello</h1>'
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('get wrapped in a document', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert(/^<!DOCTYPE html/.test(source.html));
        assert(/<h1>hello<\/h1>/.test(source.html));
      });
    });

    describe('simple html', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: '<h1>hello</h1>'
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('get wrapped in a document', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert(/^<!DOCTYPE html/.test(source.html));
        assert(/<h1>hello<\/h1>/.test(source.html));
      });
    });

    describe('document html', function() {
      beforeEach(function() {
        this.props = {
          embed: {
            html: `<html>
                <head></head>
                <body><h1>hello</h1></body>
              </html>`
          }
        };

        this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.props}/>);
        this.instance = this.wrapper.instance();
      });

      it('does not wrap in a document', function() {
        var source = this.wrapper.find('WebView').props().source;
        assert(!/^<!DOCTYPE html/.test(source.html));
        assert(/<h1>hello<\/h1>/.test(source.html));
      });
    });
  });

  describe('on webview loaded', function() {
    beforeEach(function() {
      this.webview = this.wrapper.find('MagnetWebView');
      this.onLoaded = this.webview.props().onLoaded;
    });

    it('does not flex to fill available space by default', function() {
      assert.equal(reduceStyle(this.wrapper).flex, 0);
      assert.equal(reduceStyle(this.webview).flex, 0);
    });

    describe('overflowing', function() {
      beforeEach(function() {
        this.height = this.wrapper.state().height;
        assert(this.height);
        this.onLoaded({ height: 800 });
      });

      it('maintains the same height', function() {
        assert.equal(this.wrapper.state().height, this.height);
      });

      describe('expanded', function() {
        beforeEach(function() {
          this.wrapper.setProps({ expanded: true });
          this.webview = this.wrapper.find('MagnetWebView');
        });

        it('flexes the webview to fill the expanded space', function() {
          assert.equal(reduceStyle(this.wrapper).flex, 1);
          assert.equal(reduceStyle(this.webview).flex, 1);
        });
      });
    });

    describe('mid-range', function() {
      beforeEach(function() {
        this.height = this.wrapper.state().height;
        assert(this.height);
        this.onLoaded({ height: 240 });
      });

      it('matches the content height', function() {
        assert.equal(this.wrapper.state().height, 240);
      });

      describe('expanded', function() {
        beforeEach(function() {
          this.wrapper.setProps({ expanded: true });
          this.webview = this.wrapper.find('MagnetWebView');
        });

        it('does not flex the webview to fill the expanded space', function() {
          assert.equal(reduceStyle(this.wrapper).flex, 0);
          assert.equal(reduceStyle(this.webview).flex, 0);
        });
      });
    });
  });

  function reduceStyle(el) {
    var style = [].concat(el.props().style);
    return Object.assign.apply(null, style);
  }
});