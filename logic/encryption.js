var crypto = require('crypto');
var uuid = require('node-uuid');

exports.createSalt = function(){
  return uuid.v1();
}
function hash(passwd, salt){
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
};
 
exports.hashPassword = function(passwordString, salt){
    return hash(passwordString, salt);
};
 
exports.isValid = function(passwordHash, salt, passwordString) {
  return passwordHash === hash(passwordString, salt);
};