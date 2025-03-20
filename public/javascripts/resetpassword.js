
$(document).ready(function() {
    //$(".addmoreinformation").show();
    addlisteners();
});

function addlisteners(){
    $("#btnUpdatePassword").on("click", function(){
        updatePassword();
    });
    $("#btnreset").on("click", function(){
        $(".information").text("");
        $(".password").val("").removeClass("declined").removeClass("approved");
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
}
function verifyForm(){
    return !($("#inputPassword").hasClass("declined") || $("#inputPasswordAgain").hasClass("declined")); 
}

function updatePassword(){
    if(!verifyForm())
        return;
	var data = {
            "id": $("#inputUserID").val(),
	    	"password": $("#inputPassword").val(),
            "token": $("#inputToken").val()
	    };
	$.ajax({
		type: 'PUT',
	    url: "/user/updatepassword",
	    contentType: "application/json",
	    dataType: 'json',
	    data: JSON.stringify(data),
	    success: function(json) {
            $("#createtitle").text(lang.ResetPassword.PasswordUpdated + "").addClass("success").removeClass("failed");
            setTimeout(function(){
                $("#createtitle").text(lang.ResetPassword.ResetPassword + "").removeClass("success").removeClass("failed");
            }, 1600);
        },
	    error: function(e){
            $("#createtitle").text(lang.UserProfileUpdateFailed + " " + e.message).addClass("failed").removeClass("success");
	    }
	});
}
