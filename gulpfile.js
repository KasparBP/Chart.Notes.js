var gulp = require('gulp');

var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename')

var paths = {
  scripts: ['./src/*.js']
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build', function() {
    return gulp.src('./src/*.js')
        .pipe(
            browserify({
                ignore: 'chart.js'})
        )
        .pipe(rename('Chart.Notes.js'))
        .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['build']);
});

// Default Task
gulp.task('default', ['lint', 'build']);