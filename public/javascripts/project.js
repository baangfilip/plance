var liftmodule;
$(document).ready(function(){
    liftmodule.init({classname: 'lift', projectid: project.id, container: '#lift-container', readonly: readonly});
    if(!readonly){
        $("#addlist").on("click", function(){
            liftmodule.addlist();
        });
    }else{
        $("#addlist").hide();
    }
    modalitem = $('[data-remodal-id=modal-item]').remodal();
    modallist = $('[data-remodal-id=modal-list-name]').remodal();
    $(document).on('opening', '[data-remodal-id=modal-item]', function (event) {
        liftmodule.lastClickedItem = liftmodule.lastClickedItem != 0 ? liftmodule.lastClickedItem : liftmodule.dummy; 
        $("[data-remodal-id=modal-item]").find("#modal-container #itemid").text(liftmodule.lastClickedItem.id);
        $("[data-remodal-id=modal-item]").find("#modal-container #title").val(htmlDecode(liftmodule.lastClickedItem.name));
        $("[data-remodal-id=modal-item]").find("#modal-container #text").val(htmlDecode(liftmodule.lastClickedItem.text));
        $("[data-remodal-id=modal-item]").find("#modal-container #itemcreated").text(liftmodule.lastClickedItem.created);
        $("[data-remodal-id=modal-item]").find("#modal-container #itemmodified").text(liftmodule.lastClickedItem.modified);
        $("[data-remodal-id=modal-item]").find("#modal-container #points").val(liftmodule.lastClickedItem.points);
        $("[data-remodal-id=modal-item]").find("#modal-container #views").text(liftmodule.lastClickedItem.views);
        $("[data-remodal-id=modal-item]").find("#modal-container #item-link").val("" + liftmodule.lastClickedItem.link + "");
        $("[data-remodal-id=modal-item]").find("#modal-container #category").val(liftmodule.lastClickedItem.categoryid);
        $("[data-remodal-id=modal-item]").find("#modal-container #progress").val(liftmodule.lastClickedItem.progress);
        $("[data-remodal-id=modal-item]").find("#modal-container #ownerid").val(liftmodule.lastClickedItem.ownerid);
        if(readonly){
            $(".remodal-confirm").hide();
            $(".remodal-cancel").hide();
            $("[data-remodal-id=modal-item]").find("#modal-container input").attr('readonly', 'readonly');
            $("[data-remodal-id=modal-item]").find("#modal-container textarea").attr('readonly', 'readonly');
        }
    });
    $(document).on('opening', '[data-remodal-id=modal-list-name]', function (event) {
        console.log(liftmodule.lastClickedList);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-title").val(htmlDecode(liftmodule.lastClickedList.name)); 
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-id").text(liftmodule.lastClickedList.id);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-modified").text(liftmodule.lastClickedList.listmodified);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-created").text(liftmodule.lastClickedList.listcreated);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-ruler").text(liftmodule.lastClickedList.ruler);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-userid").val(liftmodule.lastClickedList.userid);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-link").val(liftmodule.lastClickedList.link);
        $("[data-remodal-id=modal-list-name]").find("#modal-container #list-text").text(htmlDecode(liftmodule.lastClickedList.description));
        if(readonly){
            $(".remodal-confirm").hide();
            $(".remodal-cancel").hide();
            $("[data-remodal-id=modal-list-name]").find("#modal-container input").attr('readonly', 'readonly');
            $("[data-remodal-id=modal-list-name]").find("#modal-container textarea").attr('readonly', 'readonly');
        }
    });

    $(document).on('opening', '[data-remodal-id=modal]', function (event) {
        console.log(project);
        $("[data-remodal-id=modal]").find("#modal-container #project-id").text(project.id);
        $("[data-remodal-id=modal]").find("#modal-container #project-title").val(htmlDecode(project.name));
        $("[data-remodal-id=modal]").find("#modal-container #project-created").text($.format.date(project.created, "dd-MM-yyyy"));
        $("[data-remodal-id=modal]").find("#modal-container #project-public").text(project.public == 1 ? true : false);
        $("[data-remodal-id=modal]").find("#modal-container #project-private").text(project.userid != 0 ? true : false);
        if(readonly){
            $(".remodal-confirm").hide();
            $(".remodal-cancel").hide();
            $("[data-remodal-id=modal]").find("#modal-container input").attr('readonly', 'readonly');
            $("[data-remodal-id=modal]").find("#modal-container textarea").attr('readonly', 'readonly');
        }
    });

});
var socket;
var emitter = false;
window.onbeforeunload = function(e) {
  socket.emit('leaveroom', {uuid: project.uuid, username: (user ? user.username : "guest")});;
};
$(document).ready(function() {
    socket = io.connect(); 
    socket.emit('joinroom', {uuid: project.uuid, username: (user ? user.username : "guest")});
    socket.on('roomcount', function (data) {
        console.log(data);
        $("#usercount").html(data.users + " " + lang.UsersInProject);
        if(data.users > 1)
            $("#usercount").text($("#usercount").text().replace(/,/g, " & "));
    });
    socket.on('itemmove', function (data) {
        if(!emitter)
            $("li[data-id='"+data.id+"']").addClass("li-moving").
                css("left", data.x).
                css("top", data.y);
        if(data.finished){
            $("li[data-id='"+data.id+"']").removeClass("li-moving").css("left", data.x).css("top", data.y);
            $("ul[data-id='"+data.ul+"']").append($("li[data-id='"+data.id+"']"));
            $("li[data-id='"+data.id+"']").insertAfter($("li[data-id='"+data.id+"']").siblings(':eq('+(data.position-1)+')')).css("left", "0").css("top", "0");
        }

        //html("id: " + data.liID + ", x:" + data.x + ", y: " + data.y);
    });
    socket.on('itemupdate', function (data) {
        liftmodule.updateItemOnPage(data);
    });
    
    socket.on('listupdate', function (data) {
        liftmodule.updateListOnPage(data);
    });
    socket.on('updateListPosition', function (data) {
        liftmodule.updateListPosition(data);
    });
    socket.on('addlist', function (data) {
        liftmodule.addListToPage(data); 
    });    

    socket.on('additem', function(data){
        liftmodule.addItemToPage(data);   
    });
    socket.on('remove', function (data) {
        liftmodule.removeItemOnPage(data);
    });

    $("#vertical").on("click", function(){
        //toggle width to height
        if($(".lift").hasClass("vertical")){
            //switching to horizontal
            $( ".lift li" ).each(function( index ) {
                if(!$(this).hasClass("listname") && !$(this).hasClass("additem")){
                    var points = $(this).attr("points");
                    $( this ).css("width", ( points > 0.9 ? points*20 : "0px" ) );
                    $( this ).css("height", "45px");
                }
            });
        }else{
            //switching to vertical
            $( ".lift li" ).each(function( index ) {
                if(!$(this).hasClass("listname") && !$(this).hasClass("additem")){
                    var points = $(this).attr("points");
                    //$( this ).css("height", ( points > 0.9 ? points*45 : "45px" ) );
                }
            });
        }
        $(".lift").toggleClass("vertical");
        $("#vertical").toggleClass("fa-rotate-90");
        
    });
    $("#truepoints").on("click", function(){
        $(".lift").toggleClass("truepoints");
        $("#truepoints").toggleClass("fa-calendar-o");
    });

    $("#showfinished").on("click", function(){
        $(".lift").toggleClass("finished");
        $("#showfinished").toggleClass("fa-calendar-times-o").toggleClass("fa-calendar-check-o");
    });


    $("#zoom-out").on("click", function(){
        $("#lift-container").css("zoom", ($("#lift-container").css("zoom")*0.9));
        if($("#lift-container").css("zoom") != 1){
            $("#zoom-warning").html(lang.ZoomWarning).find("#reset-zoom").on("click", function(){
                $("#lift-container").css("zoom", "1");
                $("#zoom-warning").text("");
            });
        }
    });

    $("#zoom-in").on("click", function(){
        $("#lift-container").css("zoom", ($("#lift-container").css("zoom")*1.1));
        if($("#lift-container").css("zoom") != 1){
            $("#zoom-warning").html(lang.ZoomWarning).find("#reset-zoom").on("click", function(){
                $("#lift-container").css("zoom", "1");
                $("#zoom-warning").text("");
            });
        }
    });

});

function emitMessage(name, data){
    data.uuid = project.uuid;
    socket.emit(name, data);
}

