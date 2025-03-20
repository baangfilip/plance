var tokenDAO = require('../dao/tokenDAO');
var encryption = require('../logic/encryption');

function createToken(userid, url, salt){
  var encryptedToken = encryption.hashPassword((userid + url + ""), salt);
  return encryptedToken;
}

exports.CreateResetPasswordLink = function(userid, url, callback){
  var salt = encryption.createSalt();
  var token = createToken(userid, url, salt);
  tokenDAO.saveResetPasswordToken(userid, token, salt, function(err, result){
    callback(url + "/resetpassword/" + userid + "/" + token);
  });
};

function tokenDateIsValid(date){
  var UTCDateTime = new Date().toISOString().replace(/T/, ' ');//.replace(/\..+/, '');
  var today = UTCDateTime.substring(0, 10);
  var tokenDate = new Date(date).toISOString().replace(/T/, ' ').substring(0, 10);
  if(tokenDate != today){
    return false;//old token
  }else{
    return true;
  }
}

exports.isValidToken = function(token, userid, url, remove, callback){
  tokenDAO.getResetPasswordTokenForUserID(userid, token, function(err, result){ 
    if(result[0] == null){
      callback(-1);
      return;
    }else if(!tokenDateIsValid(result[0].created)){
      tokenDAO.deleteToken(token, function(err, res){
        //token deleted
        callback(0);
        return;
      });
    }
    var salt = result[0].salt;
    var hash = result[0].token;
    var valid = encryption.isValid(hash, salt, (userid + url + ""));
    if(valid && userid == result[0].userid){
      if(remove){
        tokenDAO.deleteToken(token, function(err, res){
          //token deleted after its verfied used ;)
          callback(1);
          return;
        });
      }else{
        callback(1);
        return;
      }
      
    }else{
      callback(-1);
      return;
    }
  });
};