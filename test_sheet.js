const mongoose = require('mongoose');
const SheetSession = require('./src/models/SheetSession').default || mongoose.model('SheetSession', require('./src/models/SheetSession').schema);
console.log(SheetSession);
