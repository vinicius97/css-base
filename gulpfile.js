var gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');

var imageop = require('gulp-image-optimization'),
	stylus = require('gulp-stylus'),
	path = require('path'),
	cleanCSS = require('gulp-clean-css'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	pump = require('pump'),
	font2css = require('gulp-font2css').default,
	runTimestamp = Math.round(Date.now()/1000),
	mainDir = './src/main/webapp/resources/',
	sourceDir = mainDir+'src/',
	distDir = mainDir+'dist/',
	runSequence = require('run-sequence');


//GERA ESTRUTURA DE PASTAS
gulp.task('vsboilerplate', function() {
  return gulp.src('./')
    .pipe(gulp.dest(sourceDir))
    //gera pastas css
    .pipe(gulp.dest(sourceDir+'css/globals/'))
    .pipe(gulp.dest(sourceDir+'css/templates'))
    .pipe(gulp.dest(sourceDir+'css/modules'))
    //gera pastas fonts
    .pipe(gulp.dest(sourceDir+'fonts/ttf'))
    //gera pasta img
    .pipe(gulp.dest(sourceDir+'img'))
    //gera pasta js
    .pipe(gulp.dest(sourceDir+'js/app'))
    .pipe(gulp.dest(sourceDir+'js/plugins'))
    //gera pasta dist
    .pipe(gulp.dest(distDir))
 });

//IMAGE OPTIMIZE 
gulp.task('images', function(cb) {
	gulp.src([sourceDir+'/img/**/*.png',sourceDir+'/img/**/*.svg']).pipe(imageop({
		optimizationLevel: 5,
		progressive: true,
		interlaced: true
	})).pipe(gulp.dest(distDir+'/img/')).on('end', cb).on('error', cb);
});


//COMPILA STYLUS
gulp.task('process-css', function () {
  return gulp.src(sourceDir+'/css/**/*.styl')
	.pipe(stylus())
	.pipe(gulp.dest(distDir+'/css/'));
});



//AUTO PREFIXER
gulp.task('add-prefixes', () =>
	gulp.src(distDir+'/css/*.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(distDir+'/css/'))
);

//COMPRIME CSS
gulp.task('compress-css', function() {
  return gulp.src(distDir+'/css/*.css')
	.pipe(cleanCSS({compatibility: 'ie8', processImport: false}))
	.pipe(gulp.dest(distDir+'/css/'));
});


// Executa todas as funções relativas ao css
gulp.task('compile-css', function (done) {
	runSequence(
		'process-css',
		'add-prefixes',
		'compress-css',
	done);
	gulp.watch(sourceDir+'/css/**/*.styl', ['compile-css']);  // VERIFICA ALTERAÇÕES NOS ARQUIVOS stylus PARA COMPILAR EM TEMPO REAL
});


//FUNÇÕES JS

gulp.task('concat-js', function() {
  return gulp.src(sourceDir+'/js/**/*__concat.js')
	.pipe(concat('main.js'))
	.pipe(gulp.dest(distDir+'/js/'));
});

//COMPRESS JS
gulp.task('compress-js', function (cb) {
  pump([
		gulp.src(['!./src/main/webapp/resources/src/js/**/*__*.js',sourceDir+'/js/**/*.js',distDir+'/js/main.js']),
		uglify(),
		gulp.dest(distDir+'/js/')
	],
	cb
  );
});

// Executa todas as funções relativas ao js
gulp.task('compile-js', function (done) {
	runSequence(
		'concat-js',
		'compress-js',
	done);
	gulp.watch(sourceDir+'/js/**/*', ['compile-js']);  // VERIFICA ALTERAÇÕES NOS ARQUIVOS stylus PARA COMPILAR EM TEMPO REAL
});


//FONTS

gulp.task('gen-fonts', function() {
  return gulp.src(sourceDir+'/fonts/**/*.{otf,ttf,woff,woff2}')
	.pipe(font2css())
	.pipe(concat('fonts.css'))
	.pipe(gulp.dest(distDir+'/css/fonts/'))
})


gulp.task('compile-fonts', function (done) {
	runSequence(
		'gen-fonts',
		'process-css',
		'add-prefixes',
		'compress-css',
	done);
	gulp.watch(sourceDir+'/css/**/*.styl', ['compile-fonts']);  // VERIFICA ALTERAÇÕES NOS ARQUIVOS stylus PARA COMPILAR EM TEMPO REAL
});

gulp.task('compile-all', function (done) {
	runSequence(
		'images',
		'gen-fonts',
		'process-css',
		'add-prefixes',
		'compress-css',
	done);
});


// Default
gulp.task('default', ['build']);