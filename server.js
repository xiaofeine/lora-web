
var express = require('express')
var path = require('path')

var app = express()

app.use(express.static('dist'));

app.get('*', function (req, res) {
	res.sendFile(path.join(__dirname, 'dist/index.html'))
})

var PORT = process.env.PORT || 8090
app.listen(PORT, function() {
	console.log('Production Express server running ')
})
