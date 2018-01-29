// Used Components
const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path'); 

// Initialize Multer Middleware
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + req.user.username + '_' + file.originalname);
    }
});

var filter = function (req, file, callback) {
        // accept image only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Nur Bilder (jpg, jpeg, png und gif) sind erlaubt!'), false);
        }
        callback(null, true);
}  

var upload = multer({ storage : storage, fileFilter : filter}).single('fileinput');

// Image Upload
router.get('/image_upload', ensureAuthenticated, function(req, res) {

    // read files in upload folder
    const uploadFolder = './public/uploads/';
    fs.readdir(uploadFolder, function(err, files) {
        if(err) {
            req.flash('danger', 'Fehler beim Lesen des Upload Verzeichnisses. Seite muss verlassen werden, da Fehler beim Laden der Seite auftrat' + err);
            res.redirect('/overview/show');
        } else {
            var file_array = [];
            files.forEach(file => {
                // get size
                let fileSizeInBytes = fs.statSync(uploadFolder + file).size;
                // get full URL path
                let fileURL = uploadFolder.substr(8) + file;
                // get domainname
                let fileDomain = req.get('host');
                // output aray
                file_array.push({'file_name':file,'file_size':fileSizeInBytes, 'file_link':'http://' + fileDomain + fileURL});
            });

            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.render('admin_image_upload', {
                user: req.user,
                files: file_array
            });
        }
        
    });

    

});

// Image Upload
router.post('/image_upload', ensureAuthenticated, function(req, res) {
    //Multer File Upload logic
    upload(req,res,function(err) {
        if(err) {
            req.flash('danger', 'Fehler beim Hochladen des Bildes' + err);
            res.redirect('/admin/image_upload');
            return;
        } 

        // image validation
        if (typeof req.file === "undefined"){
            req.flash('danger', 'Keine Datei ausgewählt');
            res.redirect('/admin/image_upload');
            return;   
        }        

        httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body) + ' File: ' +JSON.stringify(req.file));
        req.flash('success', 'Hochladen des Bildes erfolgreich "' + req.user.username + '_' + req.file.originalname + '"');
        res.redirect('/admin/image_upload');
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Bitte erneut einloggen');
        res.redirect('/users/login');
    }
}

module.exports = router;