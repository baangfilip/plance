
var socket; 
$(document).ready(function() { 
    socket = io.connect(); 
	getProjects();
    $('#username').on('input', function() {
        if($('#username').val().length > 2){
            $('.addmoreinformation').slideDown();
        }else{
            $('.addmoreinformation').slideUp();
        }
    });
	$("#btnLogin").on("click", function(){
		signin();
	});
	$("#topBar #menu #logout").on("click", function(){
		signout();
	});
	$('#username').on('input', function() {
        if($('#username').val().length > 2 && (/^[a-zA-Z]+$/).test($('#username').val())){
            $('#username').removeClass("declined");
        }else if($('#username').val().length == 0){
            $('#username').removeClass("approved");
            $('#username').removeClass("declined");
        }else{
            $('#username').removeClass("approved");
            $('#username').addClass("declined");
        }
    });
    $('#inputPassword').on('keyup', function(e) {
        if(e.keyCode == 13){
            signin();
        }
    });
    $('#inputPassword').on('input', function() {
        if($('#inputPassword').val().length > 5){
            $('#inputPassword').removeClass("declined");
        }else if($('#inputPassword').val().length == 0){
            $('#inputPassword').removeClass("approved");
            $('#inputPassword').removeClass("declined");
        }else{
            $('#inputPassword').removeClass("approved");
            $('#inputPassword').addClass("declined");
        }
    });
    socket = io.connect(); 
    socket.on('info', function (data) {
        $("#usercount").html(data.userCount + " " + lang.UsersOnline);
    });
	addlisteners();
});

function addlisteners(){

	$('#title').on('input', function() {
		if($('#title').val().length > 2){
            $('.addmoreinformation').slideDown();
            getGroupsForUser();
        }else{
            $('.addmoreinformation').slideUp();
        }
    });
	$("#btnAddProject").on("click", function(){
		addProject();
	});
	$("#btncancel").on("click", function(){
	    $("#title").val("");
		$("#inputProjectPublic").val("");
        $('.addmoreinformation').slideUp();
	});
	$("#btnForgotPassword").on("click", function(){
	    console.log("Give user chance to reset password");
        $(".addmoreinformation").append("<div id='resetPassword'><button class='submit'>Send me a reset passwordlink!</button></div><div id='resetPasswordResult'></div>");
        //slide a thingy down and then let them click "sendResetEmail" if they typed a valid username
        $("#resetPassword").on("click", function(){
            if($('#username').val().length > 2 && (/^[a-zA-Z]+$/).test($('#username').val())){
                sendResetPassword();
            }else{
                $("#resetPasswordResult").html("Enter a valid username first");
            }
        });
	});
	socket.on('addproject', function (data) {
        addProjectToList(data);
    });
	socket.on('removeproject', function (data) {
		if(data.type == "project")
        	$(data.identifier).remove();
    });
    $(':checkbox').checkboxpicker().hide();
    $('#inputProjectPublic').on("change", function(){
        if($(this).is(":checked")){
            $("#iconProjectPublic").addClass("fa-unlock-alt");
        }else{
            $("#iconProjectPublic").removeClass("fa-unlock-alt");
        }
    });
    $('#inputProjectGroup').on('change', function(){
        if($('#inputProjectGroup').val() != 0){
            $("#iconProjectGroup").addClass("fa-users");
        }else{
            $("#iconProjectGroup").removeClass("fa-users");
        }
    });
}

function addProject(){
	var data = {
	    	"name": $("#title").val(),
	    	"public": ($("#inputProjectPublic").is(":checked") ? "1" : "0"),
            "groupid": $("#inputProjectGroup").val()
	    };
	$.ajax({
		type: 'POST',
	    url: "/project/",
	    contentType: "application/json",
	    dataType: 'json',
	    data: JSON.stringify(data),
	    success: function(json) {
		    $("#title").val("");
			$("#inputProjectPublic").val("");
	        $('.addmoreinformation').slideUp();
            if(json.public == 1 && json.userid != 0){//only emit if this isnt private
	           socket.emit('addproject', json);
            }else{
                //its private, jsut add to this page
                addProjectToList(json, true);
            }
	    },
	    error: function(e){
	    	console.log(e);
	    }
	});
}

function deleteProject(id, groupid){
	$.ajax({
		type: 'DELETE',
	    url: "/project/" + id + "/" + groupid,
	    contentType: "application/json",
	    dataType: 'json',
	    success: function(json) {
	        socket.emit('removeproject', {"type": "project", "identifier": "#project"+id+""});
	    },
	    error: function(e){

	    }
	});
}

function signin(){
  if($("#username").val() == "" || $("#inputPassword").val() == ""){
  	alert("Username and password is mandatory");
  	return;
  }
  $.ajax({
        type: 'POST',
        url: '/login',
        dataType: 'JSON',
        data: {
        	username: $("#username").val(),
        	password: $("#inputPassword").val()
        }
    }).done(function( response ) {
		if(response.success){
            user = response.user;
        	$('#username').removeClass("declined");
        	$('#inputPassword').removeClass("declined");
        	$('#username').addClass("approved");
        	$('#inputPassword').addClass("approved");
        	$("#menu").html("<a title='"+lang.UserProfile+"' id='user' href='/profile'>"+response.user.username+"</a> <a id='logout' title='"+lang.Logout+"' href='/logout'>"+lang.Logout+"</a>");
        	$("#logintitle").text(lang.LoginSucces + "").addClass("success").removeClass("failed");
            getProjects();
        	setTimeout(function(){
        		$(".area").slideUp('fast');
        	}, 400);
        	setTimeout(function(){
        		$("#signinarea").remove();
        		$(".area").html(addProjectHTML);
		        addlisteners();
        		$(".area").slideDown('fast');
        	}, 850);
        	setTimeout(function(){
        		$("#logintitle").text(lang.NewProject + "").removeClass("success").removeClass("failed");
        	}, 1600);
        }else{
        	$('#username').removeClass("approved");
        	$('#inputPassword').removeClass("approved");
        	$('#username').addClass("declined");
        	$('#inputPassword').addClass("declined");
        }
    }).error(function(){
        $("#logintitle").text(lang.LoginFailed + "").addClass("failed");
    	$('#username').removeClass("approved");
    	$('#inputPassword').removeClass("approved");
    	$('#username').addClass("declined");
    	$('#inputPassword').addClass("declined");
    });
};


function getProjectHTML(element, user){
	return '<li id="project'+element.id+'" data-id="'+element.id+'">' +
		'<div class="title"><i class="fa fa-angle-double-down"></i><a href="/p/'+element.id+'" class="linkshowproject" rel="' + element.id + 
		'">' + element.name + ' ' + 
		'</a></div> ' +
        ((isInArray(element.groupid, (user ? user.groupids : '0')) && element.userid == 0) || element.userid == (user ? user.id : -1) ? 
                '<span class="previewprojectinfo"><i class="fa fa-user" title="'+lang.BelongsToUser+'"></i></span> ' : '') +
		'<span class="previewprojectinfo public" title="'+ (element.public ? lang.UnlockedHelp : lang.LockedHelp) + '"' +
        '><i class="fa '+ (element.public ? "fa-unlock-alt" : "fa-lock") +'"></i></span> ' +
		'<span class="previewprojectinfo projectdate" title="'+lang.Created+'"><i class="fa fa-clock-o"></i> ' + $.format.date(element.created, "dd-MM-yyyy") + '</span> ' +
		' '+
        (element.userid != (user ? user.id : -1) && element.userid == 0 ?
		'<span class="tag previewprojectinfo" title="'+lang.ProjectGroupHelp + element.groupname +'" style="background-color:'+element.groupcolor+';"><i class="fa fa-users"></i> ' + element.groupname + 
            (isInArray(element.groupid +'', ((user && user.groupids != null)? user.groupids.split(",") : [0]))  ? '' : 
                ' <i class="fa fa-exclamation-circle" title="'+lang.NotAllowedToEdit+'"></i>') + '</span> '
        : '<span class="previewprojectinfo group tag" title="'+lang.PrivateHelp+'"><i class="fa fa-user"></i> '+lang.Private+' '+ 
            (user ? '' : ' <i class="fa fa-exclamation-circle" title="'+lang.NotAllowedToEdit+'"></i>') +'</span> ') +
		((element.groupadmin && element.userid == 0 && user) || ((user ? user.id : -1) == element.userid) ? '<a href="#" class="linkdeleteproject" title="'+lang.RemoveProject+'" style="float:right;" rel="' + element.id + '"><i class="fa fa-times"></i></a>' : '') +
		'<div class="moreinfoproject" id="'+ element.id +'"><br>' +
			lang.ProjectID+': ' + element.id +
			'<div class="listsforprojects">' +
			'</div>' +
		'</div>' +
	'</li>';
}

function addProjectToList(element, newproj){
	project = $(getProjectHTML(element, user));
    console.log(element);
	$(project).find('.fa-angle-double-down').on("click", function(){
		$(this).parent().parent().find('.moreinfoproject').slideToggle('fast');
		$(project).removeClass("new");
        getMoreProjectInformation($(this).parent().parent().attr("data-id"));
	});
	$(project).find(".linkdeleteproject").on('click', function(){
		deleteProject(element.id, (element.userid == 0 ? element.groupid : 0));
	});
    if(newproj)
	   $(project).addClass("new");
	$('#lift-container ul').append(project);
}

var addProjectHTML = '<div class="addarea">'+ 
                    '<div class="icon-addprojectarea">'+
                    '<input id="title" type="text" placeholder="'+lang.AddProjectInputHelp+'" autocomplete="off"> '+
                    '<div class="addmoreinformation">'+
                        '<i id="iconProjectPublic" class="fa fa-lock"></i><label for="inputProjectPublic"> '+lang.AccessWithoutLogin+'</label>: '+
                        '<input id=inputProjectPublic" type="checkbox" data-off-title="'+lang.AccessWithoutLoginNoHelp+'" data-on-label="'+lang.Yes+'" data-off-label="'+lang.No+'" data-on-title="'+lang.AccessWithoutLoginYesHelp+'"><br>'+ 
                        '<span><i id="iconProjectGroup" class="fa fa-user"></i> '+ lang.Group+': '+
                        '<select title="'+lang.ProjectGroupHelper+'" id="inputProjectGroup"></select></span><br><br>'+ 
                        '<button class="submit" id="btnAddProject"> '+lang.AddProject+' </button>'+
                        '<button class="cancel" id="btncancel">'+lang.Cancel+'</button>'+
                    '</div>'+
                    '</div>'+   
                    '</div>';

function getProjects(){
    $.ajax({
        type: 'GET',
        url: "/project",
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            console.log(json);
            $('#lift-container ul').html("");
            $.each(json, function(index, element){
                //if user.group = project.group && user.admin == showDelete button
                addProjectToList(element, false);
            });
        },
        error: function(e){

        }
    });
}
function getGroupsForUser(){
    if($("#inputProjectGroup > option").length > 0){
        return; //already filled group select box
    }
    $.ajax({
        type: 'GET',
        url: "/user/groups/admin",
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $("#inputProjectGroup").append("<option value='0'>Private</option>");
            $.each(json, function(index, element){
                $("#inputProjectGroup").append("<option value='"+element.id+"'>"+element.name+"</option>");
            });
        },
        error: function(e){

        }
    });
}

function sendResetPassword(){
    $("#resetPasswordResult").html("<i class='fa fa-circle-o-notch fa-spin'></i>");
    var data = {
            "username": $("#username").val()
        };
    $.ajax({
        type: 'POST',
        url: "/resetpassword",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify(data),
        success: function(json) {
            $("#resetPasswordResult").html(json.message);
        },
        error: function(e){
            $("#resetPasswordResult").html(e.statusText);
            console.log(e);
        }
    });
}

function getMoreProjectInformation(id){
    console.log("Get more information for: " + id);
    var moreinfoarea = $("#project" + id).find('.moreinfoproject');
    moreinfoarea.html('<i class="fa fa-circle-o-notch fa-spin"></i>');
    $.ajax({
        type: 'GET',
        url: "/project/" + id,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            //console.log(json)        
            moreinfoarea.text('');
            moreinfoarea.append(lang.ProjectID+": " + id + "<br>" +
                lang.NumberOfItems+": " + json.nbrOfItems + "<br>" +
                lang.NumberOfLists+": " + json.nbrOfLists + "<br>" + 
                lang.CreatedBy+": " + json.createdby);
        },
        error: function(e){
            moreinfoarea.append('Couldnt fetch information');
        }
    });
}