var express = require("express");
var multiparty = require("multiparty");
// var gm = require('gm').subClass({imageMagick: true});
var gm = require("gm");
var fs=require("fs");
var bodyParser = require("body-parser");
var router = express.Router();
var app = express();
var _path = "/新建文件夹/upload/API/public/file/";

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.listen(8888);


router.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Credentials", "true");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header("X-Powered-By",' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


router.post("/upload",function(req,res,next){
	//生成multiparty对象，并配置上传目标路径
	var form = new multiparty.Form({uploadDir:"./public/file/"});
	//上传完成后处理
	form.parse(req,function(err,fields,files){
		var relPath="";
		if(err){
			console.log("Parse error: "+err);
		}
		else{
			console.log("parse files: "+JSON.stringify(files,null,2));
			processImg(req,res,files).then(function(data){
				res.jsonp({
					res:JSON.parse(data.filesTmp),
					relPath:data.relPath
				});
			}).catch(function(err){
				console.log(err);
			});
		}
	});
});

router.get("/manager",function(req,res,next){
	var FS_PATH_FILES = "./public/file/";
	var arrs = [];
	var port = process.env.PORT || "8888";
	var relPath = "";

	fs.readdir(FS_PATH_FILES,function(err,list){
		if(err){
			throw err;
		}
		for(var e;list.length && (e = list.shift());){
			relPath = 'http://' + req.hostname  + _path + e;
			relName = e;
			arrs.push([relPath,relName]);
		}
		res.jsonp({arrs:arrs.reverse()});
	});
});

router.post("/delete",function(req,res,next){
	var path = "./public/file/" + req.body.fileName;
	try{
		//同步删除文件
		fs.unlinkSync(path);
		res.json({success:true});
	}catch(e){
		res.json({success:false});
	}
});

app.use("/",router);


function processImg(req,res,files){
	var filesTmp = JSON.stringify(files,null,2);
	return new Promise(function(resolve,reject){
		var img = files.filedata[0];
		var uploadedPath = img.path;
		var dateSymbol = new Date().toLocaleDateString().split("-").join("");
		var timeSymbol = new Date().getTime().toString();
		gm(uploadedPath).size(function(err,size){
			console.log(size);
			var dstPath = "./public/file/" + dateSymbol + timeSymbol + "_" + "." + img.originalFilename.split(".")[1];
			var port = process.env.PORT || "8888";
			console.log(__dirname);
			relPath = 'http://' + req.hostname  + _path + dateSymbol + timeSymbol + '_' + '.' + img.originalFilename.split('.')[1];
			//重命名
			fs.rename(uploadedPath,dstPath,function(err){
				if(err){
					reject(err);
				}else{
					console.log("rename OK");

					resolve({filesTmp,relPath});

					//对上传的图片进行压缩
					// var path = dstPath.split(".");
					// var promises = [800,400,200].map(function(item){
					// 	return reSizeImage(path,dstPath,item);
					// });

					// Promise.all(promises).then(function(){
					// 	resolve({filesTmp,relPath});
					// }).catch(function(err){
					// 	console.log(err);
					// })
				}
			});	
		});	
	})
}

function reSizeImage(paths,path,size){
	return new Promise(function(resolve,reject){
		console.log("." + paths[1] + "@" + size + "." + paths[2]);
		gm(path)
		.noProfile()
		.resizeExact(size)
		.write("." + paths[1] + "@" + size + "." + paths[2],function(err){
			if(!err){
				console.log("resize as " + size + "OK");
				resolve();
			}else{
				console.log(12);
				reject(err);
			}
		});
	});
}