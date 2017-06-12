(function(){
    var Upload = React.createClass({
        getInitialState:function(){
            return{
                uploadHistory:[],
                uri:this.props.uri || "/",
                size:this.props.size || 20,
                files:this.props.files || [],
                multiple:this.props.multiple || false,
                progress:[]
            }
        },
        //取消拖拽时鼠标经过样式
        handleDragHover:function(e){
            e.stopPropagation();
            e.preventDefault();
        },
        //文件拖放处理
        handleDrop:function(e){
            this.setState({
                progress:[]
            });
            this.handleDragHover(e);
            //获取文件列表对象
            var files = e.target.files || e.dataTransfer.files;
            var count = this.state.multiple ?  files.length: 1;
            for(var i=0;i<count;i++){
                //根据参数即文件数据常见一个文件对应的URL
                files[i].thumb = URL.createObjectURL(files[i]);
            }
            //转换成真正的数组
            files = Array.prototype.slice.call(files,0);
            //filter返回一个通过参数函数测试的数组
            files = files.filter(function(file){
                return /image/i.test(file.type);
            });

            this.setState({
                //连接数组
                files:this.state.files.concat(files)
            });
        },
        handleChange:function(e){
            this.setState({
                progress:[]
            });
            event.preventDefault();
            var target = e.target;
            var files = target.files;
            var count = this.state.multiple ? files.length: 1;
            for(var i=0;i<count;i++){
                files[i].thumb = URL.createObjectURL(files[i]);
            }
            files = Array.prototype.slice.call(files,0);
            files = files.filter(function(file){
                return /image/i.test(file.type);
            });
            this.setState({
                files:this.state.files.concat(files)
            });
        },
        handleSuccess:function(file,res){
            this.setState({
                uploadHistory:[...this.state.uploadHistory,JSON.parse(res)]
            });
            // console.log(this.state.uploadHistory);
        },
        handleDeleteFile:function(fileDelete){
            var arrFile = [];
            for(var i=0,file;file=this.state.files[i];i++){
                 if(file != fileDelete){
                    arrFile.push(file);
                }
            }
            this.setState({
                files:arrFile
            });
        },
        //处理点击上传前删除选中图片
        handleDeleteFilePre:function(e){
            var arrFile = [];
            var e = e|| window.event;
            var target = e.target || e.srcElement;
            var id = target.name;
            var f = this.state.files[id];
            for(var i=0,file;file=this.state.files[i];i++){
                if(file != f){
                    arrFile.push(file);
                }
            }
            this.setState({
                files:arrFile
            });
        },
        handleProgress:function(file,loaded,total,idx,lengthComputable){
            if(lengthComputable){
                var percent = (loaded / total * 100).toFixed(2) + "%";
                var progress = this.state.progress;
                progress[idx] = percent;

                this.setState({
                    progress:progress
                });
                console.log(idx);
                console.log(this.state.progress[idx]);
            }
        },
        handleComplete:function(){
            console.log("upload completed");
        },
        handleFailure:function(file,res){
            console.log(res);
        },
        handleUpload:function(){
            var that = this;
            for(var i=0,file;file=this.state.files[i];i++){
                (function (file,i){
                    var xhr = new XMLHttpRequest();
                    if(xhr.upload){
                        console.log("上传中");
                        //xhr新增的监听文件上传进度
                        xhr.upload.addEventListener("progress",function(e){
                            that.handleProgress(file,e.loaded,e.total,i,e.lengthComputable);
                        },false);
                        // xhr.upload.onprogress = function(e){
                        //     that.handleProgress(file,e.loaded,e.total,i);
                        // };

                        //文件上传成功或失败
                        xhr.onreadystatechange = function(e){
                            if(xhr.readyState == 4){
                                if(xhr.status == 200){
                                    that.handleSuccess(file,xhr.responseText);
                                    console.log("一个任务上传成功");

                                    that.handleDeleteFile(file);
                                    console.log("一个任务已从上传队列中删除");

                                    if(!that.state.files.length){
                                        that.handleComplete();
                                        console.log("全部上传完毕");
                                    }
                                }
                                else{
                                    that.handleFailure(file,xhr.responseText);
                                    console.log("上传失败");
                                }
                            }
                        }

                        //发送请求上传文件
                        xhr.open("POST",that.state.uri,true);
                        // xhr.setRequestHeader("X_FILENAME",file.name);
                        var form = new FormData();
                        form.append("filedata",file);
                        xhr.send(form);
                    }
                })(file,i);
            }
        },
        renderPreview:function(){
            var that = this;
            if(this.state.files){
                return this.state.files.map(function (item,idx){
                    return (
                        <div className='upload-append-list' key={idx}>
                            <p>
                                <strong>{item.name}</strong>
                                <a href="javascript:void(0)" ref="delete" className="upload-delete" name={idx} onClick={that.handleDeleteFilePre}>删除</a>
                                <br />
                                <img src={item.thumb} className="upload-image"/>
                            </p>
                            <span className={that.state.progress[idx] ? "upload-progress":"upload-progress ry-hidden"}>
                            {that.state.progress[idx]}
                            </span>
                        </div>
                    )
                });
            }else{
                return null;
            }
        },
        renderUploadInfo:function(){
            if(this.state.uploadHistory){
                return this.state.uploadHistory.map(function(item,idx){
                    return(
                        <p key={idx}>
                            <span>上传成功，图片地址为：</span>
                            <input type="text" className="upload-url" value={item.relPath} readOnly="readOnly"/>
                            <a href={item.relPath} className="upload-see" target="_blank">查看</a>
                        </p>
                    )
                });
            }else{
                return null;
            }
        },
        render:function(){
            return (
                <form action={this.state.uri} method="POST" encType="multiple/form-data">
                    <div className="ry-upload-box">
                        <div className="upload-main">
                            <div className="upload-choose">
                                <input onChange={this.handleChange} type="file" size={this.state.size} name="file" accept="image/*" multiple={this.state.multiple} />
                                <span ref="dragBox" onDragOver={this.handleDragHover} onDragLeave={this.handleDragHover} onDrop={this.handleDrop} className="upload-drag-area">
                                或者将图片拖至此处
                                </span>
                            </div>
                            <div className={this.state.files.length?"upload-preview":"upload-preview ry-hidden"}>
                                {this.renderPreview()}
                            </div>
                        </div>
                        <div className={this.state.files.length?"upload-submit":"upload-submit ry-hidden"}>
                            <button type="button" onClick={this.handleUpload} className="upload-submit-btn">确认上传图片</button>
                        </div>
                        <div className="upload-info">{this.renderUploadInfo()}</div>
                    </div>
                </form>
            )
        }
    });

    var UploadBox = React.createClass({
        render:function(){
            return (
                <Upload uri="http://localhost:8888/upload" multiple={true} />
            )
        }
    });
    ReactDOM.render(
        <UploadBox />,
        document.getElementById("example")
    );
})();