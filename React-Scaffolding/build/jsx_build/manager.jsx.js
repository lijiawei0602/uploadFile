(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

(function () {
	var Base = function Base() {};
	Base.prototype = {
		constructor: Base,
		baseAjax: function baseAjax(url, data, type, callback) {
			if (data === false) {
				$.ajax({
					url: url,
					type: type,
					dataType: "jsonp",
					success: function success(data) {
						callback(data);
					}
				});
			} else {
				$.ajax({
					url: url,
					type: type,
					data: data,
					dataType: "jsonp",
					success: function success(data) {
						callback(data);
					}
				});
			}
		}
	};

	var base = {
		base: function base() {
			return new Base();
		}
	};

	var ImgBox = React.createClass({
		displayName: "ImgBox",

		mixins: [base],
		getInitialState: function getInitialState() {
			return {
				imgArr: []
			};
		},
		componentWillMount: function componentWillMount() {
			this.base().baseAjax("http://localhost:8888/manager", false, "GET", function (data) {
				this.setState({
					imgArr: data.arrs
				});
			}.bind(this));
		},
		handleDelete: function handleDelete(e) {
			var e = e || window.event;
			var target = e.target || e.srcElement;
			var id = target.name;
			var fileName = this.state.imgArr[id][1];
			var that = this;

			$.ajax({
				url: "http://localhost:8888/delete",
				type: "POST",
				dataType: "json",
				data: { "fileName": fileName },
				success: function success(data) {
					if (data.success === true) {
						var arr = that.state.imgArr;
						arr.splice(id, 1);
						that.setState({
							imgArr: arr
						});
					}
				}
			});
		},
		render: function render() {
			return React.createElement(
				"div",
				{ id: "main" },
				React.createElement(
					"p",
					{ className: "mainTitle" },
					"\u56FE\u7247\u7BA1\u7406\u5668"
				),
				this.state.imgArr.map(function (value, index) {
					return React.createElement(
						"div",
						{ className: "imgBox", key: index },
						React.createElement(
							"p",
							{ className: "imgTitle" },
							value[1]
						),
						React.createElement("img", { className: "img", src: value[0] }),
						React.createElement(
							"button",
							{ ref: "button", className: "button", name: index, onClick: this.handleDelete },
							"\u5220\u9664"
						)
					);
				}.bind(this))
			);
		}
	});

	ReactDOM.render(React.createElement(ImgBox, null), document.getElementById("container"));
})();

},{}]},{},[1]);
