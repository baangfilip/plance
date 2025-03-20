Pace.on("done", function(){
    $(".pace-progress").fadeOut(400);
});

$(document).ajaxStart(function() { Pace.restart(); });
$.ajaxSetup({
  complete: function(e){
    if(e.status === 200)
        $(".pace-progress").css("background", "#29C552");
    else{
        $(".pace-progress").css("background", "#C52929");
    }
  }
});
function isInArray(value, array) {
	if(typeof value !== 'undefined' && typeof array !== 'undefined' && array != null)
 		return array.indexOf(value) > -1;
 	else
 		return false;
}


function signout(){
  $.ajax({
        type: 'GET',
        url: '/logout',
        dataType: 'JSON'
    }).done(function( response ) {
		if (true == true) {
            console.log('Response: ' + response.msg);
        }else {
            console.log('Error: ' + response.msg);
        }
    });
};
function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}
function htmlDecode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').html(value).text();
}