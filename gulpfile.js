var gulp = require('gulp');

var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var paths = {
  scripts: ['./src/*.js']
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('minify', function() {
    return gulp.src('./src/*.js')
        .pipe(browserify({ignore: 'chart.js'}))
        .pipe(uglify())
        .pipe(rename('Chart.Notes.min.js'))
        .pipe(gulp.dest('./'))
});

gulp.task('build', function() {
    return gulp.src('./src/*.js')
        .pipe(browserify({ignore: 'chart.js'}))
        .pipe(rename('Chart.Notes.js'))
        .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['default']);
});

// Default Task
gulp.task('default', ['lint', 'build', 'minify']);