


exports.search = function(query, userid, callback){
  searchOptions = {
    user: userid,
    fuzzyOptions: {
      attributes: {"title"}
    },
    query: query
  }
  callback(filter(searchOptions));
};

function filter(options){

};

function index(){
  //index items, lists, projects, participants based on projects
};