var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

var src = {
    js: ['src/js/**/*.js'],
    images: 'src/images/client/img/**/*',
    sass: ['src/sass/**/*.scss'],
    html: 'src/**/*.html',
    entryjs: 'src/js/app.js'
};
var dist = {
    root: 'dist/',
    js: 'dist/js/',
    images: 'dist/images/',
    css: 'dist/css/',
    bundle: {
        path: 'dist/js/source/',
        file: 'bundle.js'
    }
};
var min = {
    js: 'all.min.js',
    css: '**/*.css'
}

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function () {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([dist.js, dist.css]);
});

gulp.task('browserify', ['clean'], function () {
    var b = browserify(src.entryjs);
    return b.bundle()
      .pipe(source(dist.bundle.file))
      .pipe(gulp.dest(dist.bundle.path))
});

gulp.task('scripts', ['browserify'], function () {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return gulp.src(dist.bundle.path + dist.bundle.file)
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat(min.js))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(dist.js));
});

// Copy all static images
gulp.task('images', ['clean'], function () {
    return gulp.src(src.images)
      // Pass in options to the task
      .pipe(imagemin({optimizationLevel: 5}))
      .pipe(gulp.dest(dist.images));
});

// Precompile SASS
gulp.task('sass', ['clean'], function () {
    return gulp.src(src.sass)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(dist.css + 'source'))
      .pipe(cssmin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(dist.css));
});

// Minify HTML
gulp.task('htmlmin', ['sass', 'scripts', 'images'], function () {
    var sources = gulp.src([dist.js + '*.js', dist.css + '*.css']);
    return gulp.src(src.html)
      .pipe(inject(sources, {relative: true}))
      .pipe(htmlmin({collapseWhitespace: false}))
      .pipe(gulp.dest(dist.root))
});
// Rerun the task when a file changes
gulp.task('watch', function () {
    gulp.watch(src.js, ['scripts']);
    gulp.watch(src.images, ['images']);
    gulp.watch(src.sass, ['sass']);
    gulp.watch(src.html, ['htmlmin']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'htmlmin']);