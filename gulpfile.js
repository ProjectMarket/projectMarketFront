var gulp = require('gulp-param')(require('gulp'), process.argv),
        inject = require('gulp-inject'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        replace = require('gulp-replace'),
        cssmin = require('gulp-cssmin'),
        clean = require('gulp-clean'),
        htmlmin = require('gulp-htmlmin'),
        ngAnnotate = require('gulp-ng-annotate'),
        jeditor = require("gulp-json-editor"),
        insertLines = require('gulp-insert-lines'),
        fs = require('fs'),
        timestamp = Date.now();

/////////////////////////
///        JS         ///
/////////////////////////

// Nettoie le dossier dist/js
gulp.task('cleanjsandcss', function () {
  return gulp.src(['./dist/assets/js/*.js', './dist/assets/css'])
          .pipe(clean({force: true}));
});

// Ajoute les balises script dans dist/index.html
gulp.task('insertjs', function () {
  return gulp.src('./dist/index.html')
          .pipe(inject(gulp.src(['./dist/assets/js/lib*.js', './dist/assets/js/isa*.js'], {read: false}, {relative: true})))
          .pipe(gulp.dest('./dist'));
});


gulp.task('scriptsisa', function () {
  return gulp.src(['./local/**/*.js', './app/pm.init.js', './app/pm-app-module.js', 'app/pm-app.bootstrap.js', './app/pm-app.config.js', './app/pm-app.run.js',
    './app/pm-app-controller.js', './app/common/common-module.js', './app/**/*.js'])
          .pipe(concat('isa.main.min.js'))
          .pipe(ngAnnotate())
          .pipe(uglify({mangle: false}))
          .pipe(rename({suffix: '-' + timestamp}))
          .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('scriptslib', function () {
  return gulp.src(['./lib/jquery/jquery.js', './lib/stacktrace/stacktrace.js'])
          .pipe(concat('lib.main.min.js'))
          .pipe(ngAnnotate())
          .pipe(uglify())
          .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('scriptslib2', function () {
  return gulp.src(['lib/componentRouter/angular_1_router.js', './lib/mdColors/colors.js'])
          .pipe(concat('lib2.main.min.js'))
          .pipe(ngAnnotate())
          .pipe(uglify())
          .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('scriptslibconcat', function () {
  return gulp.src(['./dist/assets/js/lib.main.min.js', './lib/angular/angular.min.js', './lib/angular/angular-cookies.min.js', './lib/angular/angular-aria.min.js',
    './lib/angular/angular-animate.min.js', './lib/angular/angular-sanitize.min.js', './lib/angular/angular-messages.min.js', './lib/angular/angular-message-format.min.js',
    './lib/material/angular-material.min.js', './dist/assets/js/lib2.main.min.js',
    './lib/angular-ui-select/select.min.js', './lib/moment/moment.min.js', './lib/moment/locales.min.js'])
          .pipe(concat('lib.main.min.js'))
          .pipe(ngAnnotate())
          .pipe(rename({suffix: '-' + timestamp}))
          .pipe(gulp.dest('./dist/assets/js'));
});



/////////////////////////
///        CSS        ///
/////////////////////////

// Minifie les fichiers CSS des libraires
gulp.task('csslib', function () {

  return gulp.src(['lib/material/angular-material.css', 'lib/angular-ui-select/select.css', 'lib/select2/select2.css', 'lib/font-awesome/css/font-awesome.css', 'lib/material-design-icons/css/materialdesignicons.min.css'])
          .pipe(cssmin())
          .pipe(concat("lib.main.min-" + timestamp + ".css"))
          .pipe(replace('../fonts', '../../../lib/font-awesome/fonts')) // TODO Modifier chemin !!!!!
          .pipe(gulp.dest('./dist/assets/css'));
});

// Minifie les fichiers CSS d'ISA
gulp.task('cssisa', function () {

  return gulp.src('assets/css/main.css')
          .pipe(cssmin())
          .pipe(concat("isa.main.min-" + timestamp + ".css"))
          .pipe(replace('../fonts', '../../../assets/fonts')) // TODO Modifier chemin !!!!!
          .pipe(gulp.dest('./dist/assets/css'));
});

//Ajoute les balises css dans dist/index.html
gulp.task('insertcss', function () {
  var target = gulp.src('./dist/index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths: 
  var sources = gulp.src(['./dist/assets/css/lib*.css', './dist/assets/css/isa*.css'], {read: false}, {relative: true});

  return target.pipe(inject(sources))
          .pipe(gulp.dest('./dist'));
});

/////////////////////////
///       HTML        ///
/////////////////////////

// Minifie les fichiers HTML
gulp.task('htmlminify', function () {
  return gulp.src(['./**/*.html', '!./dist/**/*.html', '!./**/index*.html'])
          .pipe(htmlmin({collapseWhitespace: true}))
          .pipe(gulp.dest('./dist'));
});


//gulp.task('default', ['cleanjs', 'scriptslib', 'scriptsisa']);

// appel de cette task -> gulp createComponent --name nameOfComponent --copyof nameOfComponentToCopy -- path pathForpm-app-component -- isProtected true/false -- crudObject 
gulp.task('createComponent', function (name, copyof, path, isProtected) {
  if (name === undefined) {
    console.log('Merci de specifier le nom du component que vous souhaitez creer en utilisant la commande \n gulp createComponent --name name.Of.Component');
    return;
  }
  var treePath = name.split('.'),
          pathUrl = '',
          fileName = '';

  fs.readFile('./app/common/values/componentsSecurity-value.js', 'utf8', function (err, data) {
    var config = JSON.parse(data.split("// Inject JSON From Gulp Task")[1]);

    var _tmp = config.pm;
    for (var i = 0; i < treePath.length; i++) {
      if (_tmp[treePath[i]] === null || typeof _tmp[treePath[i]] !== 'object') {
        _tmp[treePath[i]] = {};
      }

      if (i === treePath.length - 1) {
        _tmp[treePath[i]].isProtected = isProtected === 'false' ? false : true;
        _tmp[treePath[i]].crudObjects = [];
      }
      var _tmp = _tmp[treePath[i]];

      pathUrl += treePath[i].replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      }) + '/';
    }
    
    fileName = pathUrl.split('/')[pathUrl.split('/').length-2];
    // Sauvegarde du fichier componentSecurity-value avec le nouveau JSON
    gulp.src('./app/common/models/componentsSecurityValue-model.js')
            .pipe(rename('componentsSecurity-value.js'))
            .pipe(replace('xxx', JSON.stringify(config, null, "\t")))
            .pipe(replace("'{", " \n // Inject JSON From Gulp Task \n {"))
            .pipe(replace("}'", "} \n // Inject JSON From Gulp Task \n"))
            .pipe(gulp.dest('./app/common/values/'));


    // Création du model de base
    if (copyof === undefined) {
      //Création du template HTML de base
      gulp.src('./dev/models/model-component.html')
              .pipe(rename(pathUrl + '/' + fileName + '-component.html'))
              .pipe(gulp.dest('./app/components/'));

      //Création du component.js de base
      gulp.src('./dev/models/model-component.js')
              .pipe(rename(pathUrl + '/' + fileName + '-component.js'))
              .pipe(replace('xxx.xxx', treePath.join('.')))
              .pipe(replace('xxx/xxx/xxx', pathUrl + fileName))
              .pipe(replace('xxx', treePath[0]))
              .pipe(gulp.dest('./app/components/'));

    } else {
      // Création d'une copie d'un model existant
      var treePathCopying = copyof.split('.'),
              pathCopying = '', fileNameCopying = '';

      for (var i = 0; i < treePathCopying.length; i++) {
        pathCopying += treePathCopying[i].replace(/[A-Z]/g, function (match) {
          return '-' + match.toLowerCase();
        }) + '/';
      }
      ;
      fileNameCopying = treePathCopying[treePathCopying.length - 1].replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });

      //Création d'une copie renommée d'un template html existant
      gulp.src('./app/components/' + pathCopying + fileNameCopying + '-component.html')
              .pipe(rename(pathUrl + fileName + '-component.html'))
              .pipe(gulp.dest('./app/components/'));

      // création d'une copie renommée d'un component existant
      gulp.src('./app/components/' + pathCopying + fileNameCopying + '-component.js')
              .pipe(rename(pathUrl + fileName + '-component.js'))
              .pipe(replace(treePathCopying.join('.'), treePath.join('.')))
              .pipe(replace(pathCopying.substring(0, pathCopying.length - 1) + fileNameCopying, pathUrl.substring(0, pathCopying.length - 1) + fileName))
              .pipe(replace(treePathCopying[0] + 'Module', treePath[0] + 'Module'))
              .pipe(replace(pathCopying + fileNameCopying + '-component.html', pathUrl + fileName + '-component.html'))
              .pipe(gulp.dest('./app/components/'));

    }


    // Insert du script js dans index-dev.html
    gulp.src('./index-dev.html')
            .pipe(insertLines({
              'before': /<!--injectFromGulp-->/,
              'lineBefore': '  <script src="app/components/' + pathUrl + fileName + '-component.js"></script>'
            }))
            .pipe(gulp.dest('./'));

    // Insert de la route dans pm-app-component.js
    if (path !== undefined) {
      gulp.src('./app/pm-app-component.js')
              .pipe(insertLines({
                'before': /\'\/\*\*\'/,
                'lineBefore': '\t\t\t\t\t' + '{path: \'/' + path + '\', component: \'pm.' + treePath.join('.') + 'Component\', name:\'' +
                        treePath.join('.').replace(treePath.join('.').charAt(0), function (match) {
                  return match.toUpperCase();
                }) + '\'},'
              }))
              .pipe(gulp.dest('./app/'));
    } else {
      gulp.src('./app/pm-app-component.js')
              .pipe(insertLines({
                'before': /\'\/\*\*\'/,
                'lineBefore': '\t\t\t\t\t' + '{path: \'/' + treePath.join('/') + '\', component: \'pm.' + treePath.join('.') + 'Component\', name:\'' +
                        treePath.join('.').replace(treePath.join('.').charAt(0), function (match) {
                  return match.toUpperCase();
                }) + '\'},'
              }))
              .pipe(gulp.dest('./app/'));
    }
  });
});