var socket; 
$(document).ready(function() {
    $(".addmoreinformation").show();
    addlisteners();
});

function addlisteners(){
    $("#btnCreateAccount").on("click", function(){
        createAccount();
    });
	$('#username').on('input', function() {
        var regexcharsandnumbers = /^[A-Za-z][A-Za-z0-9]*$/;
		if($('#username').val().length > 2 && regexcharsandnumbers.test($('#username').val())){
            console.log(checkUsername($('#username').val()));
            if(checkUsername($('#username').val())){
                console.log("approved");
                $('#username').addClass("approved");
                $('#username').removeClass("declined");
                $(".information").html("");
            }else{
                $('#username').removeClass("approved");
                $('#username').addClass("declined");
                $(".information").html("" + lang.CreateAccountUsernameTaken);
            }        
        }else{
            $('#username').removeClass("approved");
            $('#username').addClass("declined");
            $(".information").html("" + lang.ErrorValueToShortAndOnlyAZ09);
        }
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
	$(".cancel").on("click", function(){
	    $("#username").val("").removeClass("declined").removeClass("approved");
		$(".password").val("").removeClass("declined").removeClass("approved");
        $("#email").val("").removeClass("declined").removeClass("approved");
	});
}

function createAccount(){
    if(!verifyForm())
        return;
	var data = {
	    	"username": $("#username").val(),
	    	"password": $("#inputPassword").val(),
            "email": $("#email").val()
	    };
	$.ajax({
		type: 'POST',
	    url: "/createaccount/",
	    contentType: "application/json",
	    dataType: 'json',
	    data: JSON.stringify(data),
	    success: function(json) {
            if(json.success){
                $("#createtitle").text(lang.CreateAccountSuccess + "").addClass("success").removeClass("failed");
                $("#menu").html("<a title='"+lang.UserProfile+"' id='user' href='/profile'>"+json.user.username+"</a> <a id='logout' title='"+lang.Logout+"' href='/logout'>"+lang.Logout+"</a>");
                setTimeout(function(){
                    $(".addarea").slideUp('fast');
                }, 400);
                setTimeout(function(){
                    $(".addarea").html("<a href='/'>Gå till start</a><br><br><a href='/profile'>Gå till min profil</a>");
                    $(".addarea").slideDown('fast');
                }, 850);
                /*setTimeout(function(){
                    $("#createtitle").text(lang.CreateAccountSuccess + "").removeClass("success").removeClass("failed");
                }, 1600);*/
            }
	    },
	    error: function(e){
	    	console.log(e);
	    }
	});
}

function verifyForm(){
    return !($("#username").hasClass("declined") || $("#inputPassword").hasClass("declined") || $("#inputPasswordAgain").hasClass("declined") || $("#email").hasClass("declined"));	
}

function checkUsername(username){
    var usernameistaken = false;
    $.ajax({
        type: 'GET',
        url: '/user/taken/' + username,
        contentType: "application/json",
        dataType: 'json',
        async: false,
        success: function(result){
            usernameistaken = (result.usernameistaken == 0);
        },
        error: function(e){
            console.log("Couldnt check username availablity");
        }
    })
    return usernameistaken;
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

