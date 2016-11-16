var gninify = require('gninify');

var project_root = '../../',
    lib_path = project_root + 'public/lib/',
    js_path = project_root + 'public/js/',
    css_path = project_root + 'public/css/',
    global_js_file = js_path + 'min/mediacad.min.js',
    global_css_file = css_path + 'min/mediacad.min.css',
    version_file = project_root + 'application/library/Version.php';

var jsLib = [
    lib_path + 'jquery/jquery.js',
    lib_path + 'bootstrap/js/bootstrap.js',
    lib_path + 'jquery-ui/jquery-ui.js',
    lib_path + 'chosen/chosen.jquery.js',
    lib_path + 'uniform/jquery.uniform.js',
    lib_path + 'select2/js/select2.js',
    lib_path + 'textareaCounter/jquery.textareaCounter.plugin.js',
    lib_path + 'treeview/jquery.treeview.js',
    lib_path + 'projekktor/projekktor-1.3.09.js',
    lib_path + 'smoothZoom/jquery.smoothZoom.js',
    lib_path + 'epubjs/jszip.js',
    lib_path + 'epubjs/mime-types.js',
    lib_path + 'epubjs/epub.js',
    lib_path + 'screenFull/screenfull.js',
    lib_path + 'highcharts/highstock.js',
    lib_path + 'highcharts/highcharts-more.js',
    lib_path + 'highcharts/modules/exporting.js',
];

var cssLib = [
    lib_path + 'bootswatch/cerulean/bootstrap.css',
    lib_path + 'font-awesome/css/font-awesome.css',
    lib_path + 'jquery-ui/jquery-ui.css',
    lib_path + 'chosen/chosen.css',
    lib_path + 'uniform/css/uniform.default.css',
    lib_path + 'select2/css/select2.css',
    lib_path + 'treeview/jquery.treeview.css',
    lib_path + 'projekktor/themes/maccaco/projekktor.style.css',
];

var jsMediacad = [
    js_path + 'select2_locale_fr.js',
    js_path + 'mediacad.js',
];

var cssMediacad = [
    css_path + 'mediacad.css'
];

new gninify.minify({
    type: 'gcc',
    language: 'ECMASCRIPT5',
    fileIn: jsLib.concat(jsMediacad),
    fileOut: global_js_file,
    callback: function(err, fileIn, fileOut) {
        if (err) {
            console.log('Impossible de minifier les JS (lib et Mediacad) dans le fichier "' + fileOut + '" : ' + err);
        } else {
            console.log('Minification des JS (lib et Mediacad) réussie dans le fichier "' + fileOut + '"');
        }
    }
});
new gninify.minify({
    type: 'clean-css',
    fileIn: cssLib.concat(cssMediacad),
    fileOut: global_css_file,
    options: ['--s0'],
    callback: function(err, fileIn, fileOut) {
        if (err) {
            console.log('Impossible de minifier les CSS (lib et Mediacad) dans le fichier "' + fileOut + '" : ' + err);
        } else {
            console.log('Minification des CSS (lib et Mediacad) réussie dans le fichier "' + fileOut + '"');
        }
    }
});
new gninify.versioning({
    versionFile: version_file,
    filenames: [global_js_file, global_css_file],
});