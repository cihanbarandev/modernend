var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  cleanCss = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  changed = require('gulp-changed'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel');

var root = './',
  nodeModules = root + 'node_modules/',
  scss = root + 'src/scss/',
  js = root + 'src/js/',
  cssDist = root + 'dist/css/',
  jsDist = root + 'dist/js/';

var jsVendorSrc = [
  nodeModules + 'jquery/dist/jquery.min.js',
  nodeModules + 'slick-carousel/slick/slick.min.js'
];

var jsSrc = [
  js + 'component1.js',
  js + 'component2.js',
  js + 'component3.js',
  js + 'component4.js'
];

var cssVendorSrc = [
  nodeModules + 'slick-carousel/slick/slick.css',
  nodeModules + 'slick-carousel/slick/slick-theme.css'
];

var imgSrc = root + 'src/img/*',
  imgDist = root + 'dist/img/';

var htmlWatchFiles = root + '**/*.html',
  styleWatchFiles = scss + '**/*.scss';

function concatVendorCss() {
  return gulp
    .src(cssVendorSrc)
    .pipe(concat('vendor.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(cssDist));
}

function css() {
  return gulp
    .src([scss + 'main.scss'])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cssDist));
}

function concatVendorJs() {
  return gulp
    .src(jsVendorSrc)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDist));
}

function javascript() {
  return (
    gulp
      .src(jsSrc)
      .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
      .pipe(babel({ presets: ['@babel/preset-env'] }))
      .pipe(concat('main.js'))
      // .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(jsDist))
  );
}

function imgmin() {
  return gulp
    .src(imgSrc)
    .pipe(changed(imgDist))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 })
      ])
    )
    .pipe(gulp.dest(imgDist));
}

function watch() {
  browserSync.init({
    server: {
      baseDir: root + 'dist'
    }
  });

  gulp.watch(styleWatchFiles, css);
  gulp.watch(jsSrc, javascript);
  gulp.watch(imgSrc, imgmin);
  gulp
    .watch([htmlWatchFiles, jsDist + 'main.js', cssDist + 'main.css'])
    .on('change', browserSync.reload);
}

exports.css = css;
exports.concatVendorCss = concatVendorCss;
exports.javascript = javascript;
exports.concatVendorJs = concatVendorJs;
exports.imgmin = imgmin;
exports.watch = watch;

var build = gulp.series(
  concatVendorCss,
  css,
  concatVendorJs,
  javascript,
  imgmin,
  watch
);
gulp.task('default', build);
