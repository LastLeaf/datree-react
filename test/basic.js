var assert = require('assert');
var jsdom = require('jsdom');
var datree = require('datree');
var React = require('react');
var ReactDOM = require('react-dom');
var ReactDOMServer = require('react-dom/server');

var datreeMixin = require('..');

describe('React Binding', function(){
    var source = null;

    before(function(cb){
        datree.MemorySource.create({
            key: 'val',
            arr: ['A', 'B'],
        }, function(s){
            source = s;
            cb();
        });
    });

    it('Should be able to get values from datree', function(cb){
        var comp = React.createClass({
            mixins: [datreeMixin],
            datreeSource: source,
            datreeStates: {
                newKey: 'key',
            },
            render: function(){
                return React.createElement('div', null, this.state.newKey);
            }
        });
        var str = ReactDOMServer.renderToStaticMarkup(
            React.createElement(comp, null, '')
        );
        setTimeout(function(){
            assert.equal(str, '<div>val</div>');
            cb();
        }, 5);
    });

    it('Should be able to request values on datree', function(cb){
        jsdom.env(
            '<div id="wrapper"></div>',
            function(err, window){
                assert.ifError(err);
                global.window = window;
                global.document = window.document;
                var comp = React.createClass({
                    mixins: [datreeMixin],
                    datreeStates: {
                        arr: source.arr,
                    },
                    render: function(){
                        return React.createElement('div', null, this.state.arr.get(2));
                    },
                    componentDidMount: function(){
                        this.state.arr.getChild('append').request('C', function(){
                            setTimeout(function(){
                                var str = document.getElementById('wrapper').childNodes[0].innerHTML;
                                assert.equal(str, 'C');
                                ReactDOM.render(React.createElement('div', null, ''), document.getElementById('wrapper'));
                            }, 25);
                        });
                    },
                    componentWillUnmount: function(){
                        cb();
                    },
                });
                var elem = React.createElement(comp, null, '');
                ReactDOM.render(elem, document.getElementById('wrapper'));
            }
        );
    });

});
