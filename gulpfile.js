var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var clean = require('gulp-clean');


//clean
gulp.task('clean', function () {
  return gulp.src(
  		[
  			'public/css/*',
  			'public/js/*',
  			'public/view/*'
  		],
  		{
  			read: false
		}
  	)
    .pipe(clean());
});


//build
gulp.task('js', function() {
    gulp.src('src/js/main.js', {
        read: false
    }).pipe(browserify())
    .pipe(rename('app.js'))
    .pipe(gulp.dest('./public/js'))
});


gulp.task('css', function() {
    return gulp.src(
        ['src/css/lib/*', 'src/css/main.css']
    ).pipe(concat('app.css'))
    .pipe(gulp.dest('./public/css'));
});



gulp.task('html', function() {
    return gulp.src(
        'src/view/**/*',
        {
        	base: 'src/view'
    	}
    ).pipe(gulp.dest('./public/view'));
});