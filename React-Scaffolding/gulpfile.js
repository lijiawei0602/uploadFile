var gulp = require("gulp");
var browserify = require("browserify");	//用来require JS 模块
var babelify = require("babelify"); 	//主要作用是进行 ES6 与 JSX的编译
var source = require("vinyl-source-stream");//把 browserify 输出的数据进行准换，使之流符合 gulp 的标准
var minifycss = require("gulp-minify-css");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var less = require("gulp-less");
var shim = require("browserify-shim");

//使用preset
// npm install --save-dev babel-preset-es2015 babel-preset-react

gulp.task("build_index",function(){
	browserify("build/jsx/index.js")
		.transform(babelify,{
			presets:["es2015","react"]
		})
		.transform(shim)
		.bundle()
		.pipe(source("index.jsx.js"))
		.pipe(gulp.dest("build/jsx_build/"));
});

gulp.task("build_main",function(){
	browserify("build/jsx/manager.js")
		.transform(babelify,{
			presets:["es2015","react"]
		})
		.transform(shim)
		.bundle()
		.pipe(source("manager.jsx.js"))
		.pipe(gulp.dest("build/jsx_build/"));
});

gulp.task("minify",function(){
	gulp.src("src/less/*.less")
		.pipe(less())
		.pipe(minifycss())
		.pipe(rename({
			suffix:".min"
		}))
		.pipe(gulp.dest("src/css_min/"));
});

gulp.task("watch",function(){
	gulp.watch("src/less/*.less",["minify"]);
	gulp.watch("build/jsx/index.js",["build_index"]);
	gulp.watch("build/jsx/manager.js",["build_main"]);
});

gulp.task("default",["watch"],function(){
	gulp.start("build_index","build_main","minify");
});

