(function(){
	var Base = function(){};
	Base.prototype = {
		constructor:Base,
		baseAjax:function(url,data,type,callback){
			if(data === false){
				$.ajax({
					url:url,
					type:type,
					dataType:"jsonp",
					success:function(data){
						callback(data);
					}
				});
			}else{
				$.ajax({
					url:url,
					type:type,
					data:data,
					dataType:"jsonp",
					success:function(data){
						callback(data);
					}
				});
			}
		}
	};

	var base = {
		base:function(){
			return new Base();
		}
	};

	var ImgBox = React.createClass({
		mixins:[base],
		getInitialState:function(){
			return{
				imgArr:[]
			}
		},
		componentWillMount:function(){
			this.base().baseAjax("http://localhost:8888/manager",false,"GET",(function (data){
				this.setState({
					imgArr:data.arrs
				});
			}).bind(this));
		},
		handleDelete:function(e){
			var e = e || window.event;
			var target = e.target || e.srcElement;
			var id = target.name;
			var fileName = this.state.imgArr[id][1];
			var that = this;

			$.ajax({
				url:"http://localhost:8888/delete",
				type:"POST",
				dataType:"json",
				data:{"fileName":fileName},
				success:function(data){
					if(data.success === true){
						var arr = that.state.imgArr;
						arr.splice(id,1);
						that.setState({
							imgArr:arr
						});
					}

				}
			});
		},
		render:function(){
			return (
				<div id="main">
					<p className="mainTitle">图片管理器</p>
				{
					this.state.imgArr.map((function (value,index){
						return(
							<div className="imgBox" key={index}>
								<p className="imgTitle">{value[1]}</p>
								<img className="img" src={value[0]} />
								<button ref="button" className="button" name={index} onClick={this.handleDelete}>删除</button>
							</div>
						)
					}).bind(this))
				}
				</div>
			)
		}
	});

	ReactDOM.render(
		<ImgBox />,
		document.getElementById("container")
	);
})();