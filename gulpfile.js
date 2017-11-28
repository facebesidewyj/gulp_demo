var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('hehe', function() {
    console.log('Hello hehe');
});

gulp.task('less', function() {
    return gulp.src('app/less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// 告知gulp先执行browserSync和less
gulp.task('watch', ['browserSync', 'less'], function() {

    // 设置热更新
    gulp.watch('app/less/**/*.less', ['less']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('browserSync', function() {
    // 设置根目录
    browserSync({
        server: {
            baseDir: 'app'
        }
    });
});

// 使用useref将多个js打包成一个js，需要用注释来设置。使用uglify压缩js
gulp.task('useref', function() {
    return gulp.src('app/*.html')
        .pipe(gulpIf('*.css', minifyCss()))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

// 使用imagemin压缩图片
gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'));
});

// 使用del来清除文件
gulp.task('clean', function(callback) {
    return del.sync('dist').then(function(cb) {
        return cache.clearAll(cb);
    });
});


// 使用del来删除文件，但不清除图片
gulp.task('clean:dist', function(callback) {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// 将任务组合到一起，打包优化
gulp.task('build', function(callback) {
    runSequence('clean:dist',
        'less', ['useref', 'images', 'fonts'],
        callback
    );
});

// 使用runSequence将开发任务按顺序组合到一起
gulp.task('default', function(callback) {
    runSequence(['less', 'browserSync'], 'watch',
        callback);
});
