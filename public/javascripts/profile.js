var socket; 
var memberOfGroups = [];
$(document).ready(function() {
    $(".addmoreinformation").show();
    $('#groupcolor').minicolors({control: 'wheel'});
    $(':checkbox').checkboxpicker().hide();
    addlisteners();
    fillFormWithUserObject();
    getGroupsForUser();
    getInvitesForUser();
});

function addlisteners(){
    $("#btnUpdateAccount").on("click", function(){
        updateAccount();
    });
    $("#btnreset").on("click", function(){
        $(".information").text("");
        $("#username").val("").removeClass("declined").removeClass("approved");
        $(".password").val("").removeClass("declined").removeClass("approved");
        $("#email").val("").removeClass("declined").removeClass("approved");
        fillFormWithUserObject();
    });
	$('#email').on('input', function() {
        var regexemail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if(regexemail.test($('#email').val())){
            if(checkEmail($('#email').val())){
                $('#email').addClass("approved");
                $('#email').removeClass("declined");
                $(".information").html("");
            }else{
                $('#email').removeClass("approved");
                $('#email').addClass("declined");
                //show restore password because email already exist
                $(".information").html("<a href=''>" + lang.CreateAccountDuplicateEmail + "</a>");
            }
        }else{
            $('#email').removeClass("approved");
            $('#email').addClass("declined");
            $(".information").html("" + lang.ErrorEmailNotValid);
        }
    });
    $('#inputPassword').on('input', function() {
        if($('#inputPassword').val().length > 5){
            $('#inputPassword').addClass("approved");
            $('#inputPassword').removeClass("declined");
            $(".information").html("");    
        }else{
            $('#inputPassword').removeClass("approved");
            $('#inputPassword').addClass("declined");
            $(".information").html("" + lang.ErrorValueToShort);
        }
    });
    $('#inputPasswordAgain').on('input', function() {
        if($('#inputPasswordAgain').val() == $('#inputPassword').val() && $('#inputPasswordAgain').val().length > 5){
            $('#inputPasswordAgain').addClass("approved");
            $('#inputPasswordAgain').removeClass("declined");
            $(".information").html("");    
        }else{
            $('#inputPasswordAgain').removeClass("approved");
            $('#inputPasswordAgain').addClass("declined");
            $('.information').html("" + lang.ErrorDuplicatePassword);
        }
    });
    //create grouplisteners

    $('#groupname').on('input', function() {
        if($('#groupname').val().length > 2){
            $('.addGroupMoreInformation').slideDown();
        }else{
            $('.addGroupMoreInformation').slideUp();
        }
    });
    $("#btnCreateGroup").on("click", function(){
        createNewGroup();
    });
    $("#btnresetgroup").on("click", function(){
        $("#groupname").val("").removeClass("declined").removeClass("approved");
        $("#groupcolor").val("").removeClass("declined").removeClass("approved");
        $("#groupopen").val("").removeClass("declined").removeClass("approved");
        $('.addGroupMoreInformation').slideUp();
    });
    $('#groupname').on('input', function() {
        var regexcharsandnumbers = /^[A-Za-z][A-Za-z0-9]*$/;
        if($('#groupname').val().length > 2 && regexcharsandnumbers.test($('#groupname').val())){
            if(checkGroupname($('#groupname').val())){
                $('#groupname').addClass("approved");
                $('#groupname').removeClass("declined");
                $(".groupinformation").html("");
            }else{
                $('#groupname').removeClass("approved");
                $('#groupname').addClass("declined");
                $(".groupinformation").html("" + lang.CreateGroupGroupNameTaken);
            }        
        }else{
            $('#groupname').removeClass("approved");
            $('#groupname').addClass("declined");
            $(".groupinformation").html("" + lang.ErrorValueToShortAndOnlyAZ09);
        }
    });
}

function updateAccount(){
    if(!verifyForm())
        return;
	var data = {
            "id": user.id,
	    	"username": $("#username").val(),
	    	"password": $("#inputPassword").val() != '******' ? $("#inputPassword").val() : '',
            "email": $("#email").val(),
            "removed": 0,
            "admin": 0
	    };
	$.ajax({
		type: 'PUT',
	    url: "/user/",
	    contentType: "application/json",
	    dataType: 'json',
	    data: JSON.stringify(data),
	    success: function(json) {
            $("#createtitle").text(lang.UserProfileUpdateSuccess + "").addClass("success").removeClass("failed");
            setTimeout(function(){
                $("#createtitle").text(lang.UserProfile + "").removeClass("success").removeClass("failed");
            }, 1600);
        },
	    error: function(e){
            $("#createtitle").text(lang.UserProfileUpdateFailed + "").addClass("failed").removeClass("success");
            setTimeout(function(){
                $("#createtitle").text(lang.UserProfile + "").removeClass("failed").removeClass("success");
            }, 1600);
	    	
	    }
	});
}

function verifyForm(){
    return !($("#username").hasClass("declined") || $("#inputPassword").hasClass("declined") || $("#inputPasswordAgain").hasClass("declined") || $("#email").hasClass("declined"));	
}

function checkEmail(email){
    var emailalreadyexist = false;
    $.ajax({
        type: 'GET',
        url: '/user/email/' + email,
        contentType: "application/json",
        dataType: 'json',
        async: false,
        success: function(result){
            emailalreadyexist = (result.emailalreadyexist == 0);
        },
        error: function(e){
            console.log("Couldnt check email availablity");
        }
    })
    return emailalreadyexist;
}

function fillFormWithUserObject(){
    $("#username").val(user.username);
    $("#inputPassword").val("******");
    $("#inputPasswordAgain").val("******");
    $("#email").val(user.email);
}

/* group functions below */
function verifyGroupForm(){
    return !($("#groupname").hasClass("declined") || $("#groupcolor").hasClass("declined")); 
}

function getInvitesForUser(){
    $.ajax({
        type: 'GET',
        url: '/group/invites/' + user.id,
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            $.each(result, function(index, element){
                var groupinvite = $(getInviteHTML(element));
                groupinvite.find(".becomemember").on("click", function(){
                    becomemember(element.id);
                });
                groupinvite.find(".declineinvite").on("click", function(){
                    removeinvite(element.id);
                });
                groupinvite.find('.more').on("click", function(){
                    $(this).parent().parent().find('.moreinfogroup').slideToggle('fast');
                    getProjectsForGroup(element.id);
                });
                $("#groupinvites").append(groupinvite);
            });
        },
        error: function(e){
            console.log("Couldnt get invites for user");
        }
    })
}

function getInviteHTML(element){
    return '<li id="group'+element.id+'">' +
        '<div class="title"><i class="fa fa-angle-double-down more"></i><h4 class="more" rel="' + element.id + 
        '">' + element.name + ' ' + 
        '</h4></div> ' +
        '<span class="tag previewgroupinfo public" title="'+lang.GroupColor+'"><i class="fa fa-paint-brush"></i> ' + element.color + '</span> ' +
        ' '+
        '<span class="tag previewgroupinfo color" style="background-color:'+element.color+';"><i class="fa fa-users"></i> ' + element.name + '</span> ' +
        '<span class="tag declineinvite"><i class="fa fa-times"></i> Decline invite </span>' +
        '<span class="tag becomemember"><i class="fa fa-plus"></i> Become member </span>' +
        '<div class="moreinfogroup" id="'+ element.id +'"><br>' +
            ''+lang.GroupID+': ' + element.id +
            '<h3 class="projectheader">'+lang.Projects+'<span class="count"></span></h3>' +
            '<table class="projectsforgroup"></table>'+
        '</div>' +
    '</li>';
}

function getGroupsForUser(){
    $.ajax({
        type: 'GET',
        url: '/user/groups/member/' + user.id,
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            $.each(result, function(index, element){
                addGroupToList(element, false);
                memberOfGroups.push(element.id);
            });
            getOpenGroups();//get other groups now
        },
        error: function(e){
            console.log("Couldnt get groups for user");
        }
    })
}

function getOpenGroups(){
    $.ajax({
        type: 'GET',
        url: '/group/open/all',
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            $.each(result, function(index, element){
                if(memberOfGroups.indexOf(element.id) == -1){
                    var group = $(getOpenGroupHTML(element));
                    $(group).find('.more').on("click", function(){
                        $(this).parent().parent().find('.moreinfogroup').slideToggle('fast');
                        getProjectsForGroup(element.id);
                    });
                    $(group).find(".becomemember").on('click', function(){
                        becomemember(element.id);
                    });
                    $("#opengroups").append(group);
                }
            });
        },
        error: function(e){
            console.log("Couldnt get groups for user");
            console.log(e);
        }
    })
}

function addGroupToList(element, newgroup){
    var group = $(getGroupHTML(element, element.admin));
    $(group).find('.more').on("click", function(){
        $(this).parent().parent().find('.moreinfogroup').slideToggle('fast');
        $(group).removeClass("new");
        getProjectsForGroup(element.id);
        if(element.admin){
            //if the viewer is a groupadmin, then we can get all the members to
            getGroupMembers(element.id);
        }
    });
    $(group).find(".linkdeletegroup").on('click', function(){
        deleteGroup(element.id);
    });
    $(group).find(".leavegroup").on('click', function(){
        leaveGroup(element.id);
    });
    if(newgroup)
        $(group).addClass("new");
    if(element.admin){
        $(group).find(".inviteemail").on('input', function() {
            var regexemail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            if(regexemail.test($(this).val())){
                $(this).addClass("approved");
                $(this).removeClass("declined");
            }else{
                $(this).removeClass("approved");
                $(this).addClass("declined");
            }
        });
        $(group).find(".submitinvite").on('click', function(){
            if($(group).find(".inviteemail").hasClass("approved")){
                inviteToGroup(element.id, group);
            }else{
                $(group).find(".inviteresult").text(lang.ErrorEmailNotValid);
            }
        });
        $("#groupadmin").append(group);
    }
    else{
        $("#membership").append(group);
    }
}


function getGroupHTML(element, isadmin){
    return '<li id="group'+element.id+'">' +
        '<div class="title"><i class="fa fa-angle-double-down more"></i><h4 class="more" rel="' + element.id + 
        '">' + element.name + ' ' + 
        '</h4></div> ' +
        '<span class="previewgroupinfo public" title="'+lang.GroupColor+'"><i class="fa fa-paint-brush"></i> ' + element.color + '</span> ' +
        ' '+ (!element.open ?
        '<span class="previewgroupinfo public" title="'+lang.GroupIsClosed+'"><i class="fa fa-lock"></i> </span> ' : '' )+
        ' '+
        '<span class="tag previewgroupinfo color" style="background-color:'+element.color+';"><i class="fa fa-users"></i> ' + element.name + '</span> ' +
        (!isadmin ? '<span class="tag leavegroup"><i class="fa fa-leaf"></i> Leave group</span>' : 
            '<a href="#" class="linkdeletegroup" title="'+lang.RemoveProject+'" style="float:right;" rel="' + element.id + '"><i class="fa fa-times"></i></a>') +
        '<div class="moreinfogroup" id="'+ element.id +'"><br>' +
            ''+lang.GroupID+': ' + element.id +
            (isadmin && !element.open ? '<div><span title="'+lang.InviteMemberHelp+'">'+lang.InviteMember+':</span> <input type="text" class="inviteemail invite">'+
                '<button class="submitinvite submit invite">'+lang.Invite+'</button> ' +
                '<span class="inviteresult"></span></div> ': '') +
            (isadmin ? '<h3 class="memberheader">'+lang.Members+'<span class="count"></span></h3>' : '') +
            '<table class="groupmembers"></table>' +
            '<h3 class="projectheader">'+lang.Projects+'<span class="count"></span></h3>' +
            '<table class="projectsforgroup"></table>'+
        '</div>' +
    '</li>';
}

function getOpenGroupHTML(element){
    return '<li id="group'+element.id+'">' +
        '<div class="title"><i class="fa fa-angle-double-down more"></i><h4 class="more" rel="' + element.id + 
        '">' + element.name + ' ' + 
        '</h4></div> ' +
        '<span class="previewgroupinfo public" title="'+lang.GroupColor+'"><i class="fa fa-paint-brush"></i> ' + element.color + '</span> ' +
        ' '+
        '<span class="tag previewgroupinfo color" style="background-color:'+element.color+';"><i class="fa fa-users"></i> ' + element.name + '</span> ' +
        '<span class="tag becomemember"><i class="fa fa-plus"></i> Become member </span>' +
        '<div class="moreinfogroup" id="'+ element.id +'"><br>' +
            ''+lang.GroupID+': ' + element.id +
            '<h3 class="projectheader">'+lang.Projects+'<span class="count"></span></h3>' +
            '<table class="projectsforgroup"></table>'+
        '</div>' +
    '</li>';
}

function deleteGroup(id){
    $.ajax({
        type: 'DELETE',
        url: "/group/" + id,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $("#group"+id).remove();
        },
        error: function(e){

        }
    });
}
function createNewGroup(){
    if(!verifyGroupForm()){
        $(".groupinformation").text("couldnt verify group form").show();
        return;
    }
    var data = {
            "name": $("#groupname").val(),
            "color": $("#groupcolor").val(),
            "open": ($("#groupopen").is(":checked") ? "1" : "0")
        };
    $.ajax({
        type: 'POST',
        url: "/group/",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify(data),
        success: function(json) {
            json.admin = 1;
            addGroupToList(json, true);
            $("#btnresetgroup").click();
        },
        error: function(e){

        }
    });
}
function checkGroupname(groupname){
    var groupalreadyexist = false;
    $.ajax({
        type: 'GET',
        url: '/group/name/' + groupname,
        contentType: "application/json",
        dataType: 'json',
        async: false,
        success: function(result){
            groupalreadyexist = (result.groupalreadyexist == 0);
        },
        error: function(e){
            console.log("Couldnt check groupname availablity");
        }
    })
    return groupalreadyexist;
}

function getGroupMembers(groupid){
    $.ajax({
        type: 'GET',
        url: '/group/members/' + groupid,
        contentType: "application/json",
        dataType: 'json',
        async: false,
        success: function(result){
            $("#group" + groupid + " .groupmembers").parent().find(".memberheader .count").text(" ("+ result.length + ")");
            if(result.length > 0){
                $("#group" + groupid + " .groupmembers tr").remove();
                $("#group" + groupid + " .groupmembers").append("<tr><th>"+ lang.Username +"</th>"+
                        "<th>"+ lang.Email +"</th><th></th></tr>");
                $.each(result, function(index, element){
                    var userrow = $("<tr><td>"+ element.username +"</td>"+
                        "<td><a href='mailto"+element.email+"'>"+ element.email +"</a></td><td>"+
                        (element.username == user.username ? '<span class="tag isYou"><i class="fa fa-user"></i> '+lang.ThisIsYou+'</span>' : '')+
                        '<span class="tag leavegroup"><i class="fa fa-times"></i> '+lang.RemoveFromGroup+'</span>'+
                        (element.admin != 1 ? '<span class="tag makeadmin" title="'+lang.GiveAdministratorHelp+'"><i class="fa fa-black-tie"></i> '+lang.GiveAdministrator+'</span>' : 
                            '<span class="tag isAdmin" title="'+lang.RemoveAdministratorHelp+'"><i class="fa fa-black-tie"></i> '+lang.Administrator+' <i class="fa fa-times"></i></span>')
                        +"</td></tr>")
                    $("#group" + groupid + " .groupmembers").append(userrow);
                    $(userrow).find(".leavegroup").on('click', function(){
                        removeuser(element.id, groupid, userrow);
                    });
                    $(userrow).find(".makeadmin").on('click', function(){
                        makeadmin(element.id, groupid, userrow);
                    });
                    $(userrow).find(".isAdmin").on('click', function(){
                        revokerights(element.id, groupid, userrow);
                    });
                });
            }
        },
        error: function(e){
            console.log("Couldnt check groupname availablity");
        }
    })
}

function getProjectsForGroup(groupid){
    $.ajax({
        type: 'GET',
        url: '/project/group/' + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            $("#group" + groupid + " .projectsforgroup").parent().find(".projectheader .count").text(" ("+ result.length + ")");
            if(result.length > 0){
                $("#group" + groupid + " .projectsforgroup tr").remove();
                $("#group" + groupid + " .projectsforgroup").append("<tr><th>"+ lang.Projectname +"</th>"+
                        "<th>"+ lang.Created +"</th></tr>");
                $.each(result, function(index, element){
                    $("#group" + groupid + " .projectsforgroup").append("<tr><td><a href='/p/"+element.id+"'>"+ element.name +"</a></td>"+
                        "<td>"+ $.format.date(element.created, "dd-MM-yyyy") +"</td></tr>");
                });
            }
        },
        error: function(e){
            console.log("Couldnt get projects for group");
        }
    })
}

function leaveGroup(groupid){
    $.ajax({
        type: 'DELETE',
        url: "/group/user/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $("#group" + groupid).slideUp('fast');
            setTimeout(function(){
                $("#group" + groupid).remove();
            }, 1000);
        },
        error: function(e){

        }
    });
}

function removeuser(userid, groupid, el){
    if(userid == user.id){
        //trying to remove self from group.....
        //see if there are any other admin gor the group, then allow it...
        if($("#group" + groupid + " .groupmembers tr").find(".isAdmin").length < 2){
            //noone to take admin for group :/
            alert(lang.RemoveFromGroupLastAdmin);
            return;
        }
    }
    $.ajax({
        type: 'DELETE',
        url: "/group/user/" + userid + "/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $(el).slideUp('fast');
            setTimeout(function(){
                $(el).remove();
            }, 1000);
        },
        error: function(e){

        }
    });
}

function makeadmin(userid, groupid, el){
    $.ajax({
        type: 'PUT',
        url: "/group/makeadmin/" + userid + "/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $(el).find(".makeadmin").html('<i class="fa fa-black-tie"></i> '+lang.Administrator+' <i class="fa fa-times"></i>').removeClass("makeadmin").addClass("isAdmin").off();
            $(el).find(".isAdmin").attr("title", lang.RemoveAdministratorHelp).on("click", function(){
                revokerights(userid, groupid, el);
            });
        },
        error: function(e){

        }
    });
}

function revokerights(userid, groupid, el){
    $.ajax({
        type: 'PUT',
        url: "/group/revokeadmin/" + userid + "/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $(el).find(".isAdmin").html('<i class="fa fa-black-tie"></i> '+lang.GiveAdministrator+'').removeClass("isAdmin").addClass("makeadmin").off();
            $(el).find(".makeadmin").attr("title", lang.GiveAdministratorHelp).on("click", function(){
                makeadmin(userid, groupid, el);
            });
        },
        error: function(e){

        }
    });
}

function becomemember(groupid){
    $.ajax({
        type: 'POST',
        url: "/group/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            memberOfGroups.push(groupid);
            $("#group" + groupid).appendTo($("#membership"));
            $("#membership #group" + groupid + " .becomemember").remove(); //hide become member button
            $("#opengroups #group" + groupid).slideUp('fast');
            $("#groupinvites #group" + groupid).slideUp('fast');
            setTimeout(function(){
                $("#opengroups #group" + groupid).remove();
                $("#groupinvites #group" + groupid).remove();
            }, 1000);
        },
        error: function(e){
            console.log(e); //already member?
        }
    });
}
function removeinvite(groupid){
    $.ajax({
        type: 'DELETE',
        url: "/group/invite/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
            $("#groupinvites #group" + groupid).slideUp('fast');
            setTimeout(function(){
                $("#groupinvites #group" + groupid).remove();
            }, 1000);
        },
        error: function(e){
            console.log(e); //already member?
        }
    });
}
function inviteToGroup(groupid, el){
    $(el).find(".inviteresult").html("<i class='fa fa-circle-o-notch fa-spin'></i>");
    console.log($(el).find(".inviteemail").val());
    var data = {
            "email": $(el).find(".inviteemail").val()
        };
    $.ajax({
        type: 'POST',
        url: "/group/invite/" + groupid,
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify(data),
        success: function(json){
            if(json.message){
                $(el).find(".inviteresult").text(json.message);
            }else{
                $(el).find(".inviteresult").text(lang.Invited + " " + $.format.date(json[0].created, "dd-MM-yyyy"));
            }
        },
        error: function(e){
                $(el).find(".inviteresult").text(e);
        }
    });
}