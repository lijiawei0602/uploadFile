(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
    var Upload = React.createClass({
        displayName: "Upload",

        getInitialState: function getInitialState() {
            return {
                uploadHistory: [],
                uri: this.props.uri || "/",
                size: this.props.size || 20,
                files: this.props.files || [],
                multiple: this.props.multiple || false,
                progress: []
            };
        },
        //取消拖拽时鼠标经过样式
        handleDragHover: function handleDragHover(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        //文件拖放处理
        handleDrop: function handleDrop(e) {
            this.setState({
                progress: []
            });
            this.handleDragHover(e);
            //获取文件列表对象
            var files = e.target.files || e.dataTransfer.files;
            var count = this.state.multiple ? files.length : 1;
            for (var i = 0; i < count; i++) {
                //根据参数即文件数据常见一个文件对应的URL
                files[i].thumb = URL.createObjectURL(files[i]);
            }
            //转换成真正的数组
            files = Array.prototype.slice.call(files, 0);
            //filter返回一个通过参数函数测试的数组
            files = files.filter(function (file) {
                return (/image/i.test(file.type)
                );
            });

            this.setState({
                //连接数组
                files: this.state.files.concat(files)
            });
        },
        handleChange: function handleChange(e) {
            this.setState({
                progress: []
            });
            event.preventDefault();
            var target = e.target;
            var files = target.files;
            var count = this.state.multiple ? files.length : 1;
            for (var i = 0; i < count; i++) {
                files[i].thumb = URL.createObjectURL(files[i]);
            }
            files = Array.prototype.slice.call(files, 0);
            files = files.filter(function (file) {
                return (/image/i.test(file.type)
                );
            });
            this.setState({
                files: this.state.files.concat(files)
            });
        },
        handleSuccess: function handleSuccess(file, res) {
            this.setState({
                uploadHistory: [].concat(_toConsumableArray(this.state.uploadHistory), [JSON.parse(res)])
            });
            // console.log(this.state.uploadHistory);
        },
        handleDeleteFile: function handleDeleteFile(fileDelete) {
            var arrFile = [];
            for (var i = 0, file; file = this.state.files[i]; i++) {
                if (file != fileDelete) {
                    arrFile.push(file);
                }
            }
            this.setState({
                files: arrFile
            });
        },
        //处理点击上传前删除选中图片
        handleDeleteFilePre: function handleDeleteFilePre(e) {
            var arrFile = [];
            var e = e || window.event;
            var target = e.target || e.srcElement;
            var id = target.name;
            var f = this.state.files[id];
            for (var i = 0, file; file = this.state.files[i]; i++) {
                if (file != f) {
                    arrFile.push(file);
                }
            }
            this.setState({
                files: arrFile
            });
        },
        handleProgress: function handleProgress(file, loaded, total, idx, lengthComputable) {
            if (lengthComputable) {
                var percent = (loaded / total * 100).toFixed(2) + "%";
                var progress = this.state.progress;
                progress[idx] = percent;

                this.setState({
                    progress: progress
                });
                console.log(idx);
                console.log(this.state.progress[idx]);
            }
        },
        handleComplete: function handleComplete() {
            console.log("upload completed");
        },
        handleFailure: function handleFailure(file, res) {
            console.log(res);
        },
        handleUpload: function handleUpload() {
            var that = this;
            for (var i = 0, file; file = this.state.files[i]; i++) {
                (function (file, i) {
                    var xhr = new XMLHttpRequest();
                    if (xhr.upload) {
                        console.log("上传中");
                        //xhr新增的监听文件上传进度
                        xhr.upload.addEventListener("progress", function (e) {
                            that.handleProgress(file, e.loaded, e.total, i, e.lengthComputable);
                        }, false);
                        // xhr.upload.onprogress = function(e){
                        //     that.handleProgress(file,e.loaded,e.total,i);
                        // };

                        //文件上传成功或失败
                        xhr.onreadystatechange = function (e) {
                            if (xhr.readyState == 4) {
                                if (xhr.status == 200) {
                                    that.handleSuccess(file, xhr.responseText);
                                    console.log("一个任务上传成功");

                                    that.handleDeleteFile(file);
                                    console.log("一个任务已从上传队列中删除");

                                    if (!that.state.files.length) {
                                        that.handleComplete();
                                        console.log("全部上传完毕");
                                    }
                                } else {
                                    that.handleFailure(file, xhr.responseText);
                                    console.log("上传失败");
                                }
                            }
                        };

                        //发送请求上传文件
                        xhr.open("POST", that.state.uri, true);
                        // xhr.setRequestHeader("X_FILENAME",file.name);
                        var form = new FormData();
                        form.append("filedata", file);
                        xhr.send(form);
                    }
                })(file, i);
            }
        },
        renderPreview: function renderPreview() {
            var that = this;
            if (this.state.files) {
                return this.state.files.map(function (item, idx) {
                    console.log(idx);
                    return React.createElement(
                        "div",
                        { className: "upload-append-list", key: idx },
                        React.createElement(
                            "p",
                            null,
                            React.createElement(
                                "strong",
                                null,
                                item.name
                            ),
                            React.createElement(
                                "a",
                                { href: "javascript:void(0)", ref: "delete", className: "upload-delete", name: idx, onClick: that.handleDeleteFilePre },
                                "\u5220\u9664"
                            ),
                            React.createElement("br", null),
                            React.createElement("img", { src: item.thumb, className: "upload-image" })
                        ),
                        React.createElement(
                            "span",
                            { className: that.state.progress[idx] ? "upload-progress" : "upload-progress ry-hidden" },
                            that.state.progress[idx]
                        )
                    );
                });
            } else {
                return null;
            }
        },
        renderUploadInfo: function renderUploadInfo() {
            if (this.state.uploadHistory) {
                return this.state.uploadHistory.map(function (item, idx) {
                    return React.createElement(
                        "p",
                        { key: idx },
                        React.createElement(
                            "span",
                            null,
                            "\u4E0A\u4F20\u6210\u529F\uFF0C\u56FE\u7247\u5730\u5740\u4E3A\uFF1A"
                        ),
                        React.createElement("input", { type: "text", className: "upload-url", value: item.relPath, readOnly: "readOnly" }),
                        React.createElement(
                            "a",
                            { href: item.relPath, className: "upload-see", target: "_blank" },
                            "\u67E5\u770B"
                        )
                    );
                });
            } else {
                return null;
            }
        },
        render: function render() {
            return React.createElement(
                "form",
                { action: this.state.uri, method: "POST", encType: "multiple/form-data" },
                React.createElement(
                    "div",
                    { className: "ry-upload-box" },
                    React.createElement(
                        "div",
                        { className: "upload-main" },
                        React.createElement(
                            "div",
                            { className: "upload-choose" },
                            React.createElement("input", { onChange: this.handleChange, type: "file", size: this.state.size, name: "file", accept: "image/*", multiple: this.state.multiple }),
                            React.createElement(
                                "span",
                                { ref: "dragBox", onDragOver: this.handleDragHover, onDragLeave: this.handleDragHover, onDrop: this.handleDrop, className: "upload-drag-area" },
                                "\u6216\u8005\u5C06\u56FE\u7247\u62D6\u81F3\u6B64\u5904"
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: this.state.files.length ? "upload-preview" : "upload-preview ry-hidden" },
                            this.renderPreview()
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: this.state.files.length ? "upload-submit" : "upload-submit ry-hidden" },
                        React.createElement(
                            "button",
                            { type: "button", onClick: this.handleUpload, className: "upload-submit-btn" },
                            "\u786E\u8BA4\u4E0A\u4F20\u56FE\u7247"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "upload-info" },
                        this.renderUploadInfo()
                    )
                )
            );
        }
    });

    var UploadBox = React.createClass({
        displayName: "UploadBox",

        render: function render() {
            return React.createElement(Upload, { uri: "http://localhost:8888/upload", multiple: true });
        }
    });
    ReactDOM.render(React.createElement(UploadBox, null), document.getElementById("example"));
})();

},{}]},{},[1]);
