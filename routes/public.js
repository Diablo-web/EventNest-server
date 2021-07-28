var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer')

dir = path.join(__dirname, '../public');
var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

router.get('*', function(req, res) {
    var file = path.join(dir, req.path);
    console.log(file)
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function() {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function() {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

router
    .post('/images', upload.single('image'), (req, res, next) => {
        try {
            var fullUrl = req.protocol + '://' + req.get('host') + '/' + req.file.path;
            return res.status(201).json({...req.file, url: fullUrl });
        } catch (error) {
            next(error);
        }
    });

module.exports = router;