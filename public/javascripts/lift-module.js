var liftmodule = (function () {
	var lift = {}; 
	lift.classname = "";
	lift.projectid = 0;
	function organize(event) {
		var target = $(event.target); 
		target.find(".additem").appendTo(target);
		//maybe take save() and that array and just update everything with a nice multi row update somehow?
		
	}
	function findNextFreeSpot(jsonArr, position, list){
		position++;
		while(typeof jsonArr[position] !== 'undefined'){
			position++;
		}
		jsonArr[position] = list;
		return jsonArr;
	}
	lift.listClickedObject; //access from outer
	lift.init = function (settings) {
		lift.projectid = settings.projectid;
		$.ajax({
		    type: 'GET',
		    url: "/list/"+settings.projectid,
		    contentType: "application/json",
		    dataType: 'json',
		    success: function(json) {
		    	/*json.lists = json.lists.sort(function(obj1, obj2) {
					return obj1.position - obj2.position;
				});*/
				var listobject;
				//(console.log(json);
				$("#header-title").text((project.name ? project.name : "no title"));
				((project.userid != (user ? user.id : -1) && (!isInArray(project.groupid +'', (user && user.groupids != null ? user.groupids.split(",") : [0]))))? $("#header-title").append(" <i class='fa fa-lock' title='"+lang.NotAllowedToEdit+"'></i>") : "")
				//sort lists in project
				var jsonArr = [];
				$.each(json, function(listpos, list){
					if(typeof jsonArr[list[0].listposition] === 'undefined'){
						//console.log(list[0].listposition);
						jsonArr[list[0].listposition] = list;
					}else{
						jsonArr = findNextFreeSpot(jsonArr, list[0].listposition, list);				
					}
				});
				//console.log(jsonArr);
				$.each(jsonArr, function(listpos, list){
					if(typeof list === 'undefined')//if list doesnt have a position
						return;
					list = list.sort(function(obj1, obj2) { //sort items in a list
						return obj1.position - obj2.position;
					});
					$.each(list, function(index, element){
						//console.log(element);
						if(index == 0)
							listobject = $('<ul data-id="'+element.listid+'" class="'+settings.classname+'" data-ul-owner="'+element.listname+'" '+
								'data-ul-ruler="'+element.ruler+'" data-ul-modified="'+element.listmodified+'" data-ul-created="'+element.listcreated+'" '+
								'data-ul-link="'+element.listlink+'" data-ul-userid="'+element.userid+'" data-ul-description="'+element.description+'"></ul>');
						if(element.id != 0){
							listobject.append('<li title="'+element.name+'" class="'+ (element.ruler ? "ruler" : "") + (element.progress == 100 ? " finished" : "") + '"' +
									'data-id="'+element.id+'" points="'+element.points+'" style="width:'+(element.points*20)+'px; '+(settings.readonly ? "cursor:pointer;" : "")+'">'+element.name+
								(element.ruler ? "<div class='rulerline'></div>" : "") +
								'</li>').find("li").on("click", function(){
								lift.lastClickedItem = element;
								modalitem.open();
							}).hover(function(){
								if(element.ruler){
									$(this).find(".rulerline").addClass("showLine");	
								}
							}, function(){
								if(element.ruler){
									$(this).find(".rulerline").removeClass("showLine");	
								}
							});
						}
						$("li .rulerline").css("height", (75*list.length)+4+"px");
						
						$(settings.container).append(listobject);
					});
				});
				lift.classname = '.'+settings.classname;
				//then make them magic
					$(lift.classname).each(function(index, element){
						var current = $(element);
						if(!settings.readonly){
							current.sortable({connectWith: [lift.classname], items: "li:not(.additem):not(.listname)", update: function(event, ui){
								organize(event);
								if (this === ui.item.parent()[0]) {
									save();
								}
							}, placeholder: 'placeholder',
								start: function(e, ui){
									if($(".lift").hasClass("vertical")){
	                                	ui.placeholder.height(ui.item.height()+28);//40 to make up for padding
	                            	}else{
	                                	ui.placeholder.width(ui.item.width()+28);//40 to make up for padding
	                            	}
						        	updatePosition(ui.item);
						    	},
						    	stop: function(event, ui){ clearInterval(updatePositionInterval); emitter = false; organize(event); emitFinished(event, ui); }});
							current.prepend("<li class='listname'>" + current.attr("data-ul-owner") + "</li>").find('.listname').on("click", function(){
								lift.lastClickedList = {"id": current.attr("data-id"), "name": current.attr("data-ul-owner"), "ruler": current.attr("data-ul-ruler"),
									"listcreated": current.attr("data-ul-created"), "listmodified": current.attr("data-ul-modified"),
									"userid": current.attr("data-ul-userid"), "description": current.attr("data-ul-description"), "link": current.attr("data-ul-link")};
								modallist.open();
							});
							current.append("<li title='"+lang.AddItem+"' class='additem'></li>");
							current.find('.listname').removeClass('ui-sortable-handle');
							current.find('.additem').removeClass('ui-sortable-handle').on("click", function(){
								addItem(this);
							});
						}else{//if readonly
							current.prepend("<li class='listname'>" + current.attr("data-ul-owner") + "</li>").find('.listname').on("click", function(){
								lift.lastClickedList = {"id": current.attr("data-id"), "name": current.attr("data-ul-owner"), "ruler": current.attr("data-ul-ruler"),
									"listcreated": current.attr("data-ul-created"), "listmodified": current.attr("data-ul-modified"),
									"userid": current.attr("data-ul-userid"), "description": current.attr("data-ul-description"), "link": current.attr("data-ul-link")};
								modallist.open();
							});
						}
					});
					if(!settings.readonly)
						makeListPositionsSortable();
		    },
		    error: function(e) {
		       console.log(e.message);
		    }
		});
	};
	lift.addlist = function(){
		$.ajax({
			type: "POST",
			url: "/list",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify({'name': 'new list', 'link': '', 'projectid': lift.projectid}),
			success: function(result){
				emitMessage('addlist', result);
			},
			error: function(e){
				console.log(e.message);
			}
		});
	};

	lift.dummy = {
		text: "new item",
		id: 0
	};

	function makeListPositionsSortable(){
		$(lift.classname).parent().sortable({items: "ul", update: function(event, ui){
								saveListPosition(event);
							}});
	}
	lift.updateListPosition = function(data){
		//alert("a list has changed position, please reload to have the latest view");
		console.log(data.data[0].items);
		$.each(data.data[0].items, function(index, element) {
		    var elem = $('ul[data-id="'+element+'"]');
		    elem.remove();
		    $(elem).appendTo("#lift-container");
		});
	}
	function saveListPosition(event){
		var data = [];
		$(lift.classname).parent().each(function(index, element){
			var list = {listid: $(element).attr('data-id'), items: $(element).sortable("toArray" , {attribute: "data-id"})};
			data.push(list);
		});
		$.ajax({
			type: 'PUT',
		    url: "/list/listorder/" + lift.projectid,
		    contentType: "application/json",
		    dataType: 'json',
		    data: JSON.stringify(data),
		    success: function(json) {
				emitMessage('updateListPosition', {data: data, uuid: project.uuid});
		    },
		    error: function(e){
		    	console.log(e);
		    }
		});
	}

	function save(event){
		var data = [];
		$(lift.classname).each(function(index, element){
			var list = {listid: $(element).attr('data-id'), items: $(element).sortable("toArray" , {attribute: "data-id"})};
			data.push(list);
		});
		$.ajax({
			type: 'PUT',
		    url: "/item/position/" +lift.projectid,
		    contentType: "application/json",
		    dataType: 'json',
		    data: JSON.stringify(data),
		    success: function(json) {

		    },
		    error: function(e){
		    	console.log(e.message);
		    }
		});
	}
	function emitFinished(event, ui){
		var ul = $("li[data-id="+lastmovedliid+"]").parent().attr("data-id");
		$.ajax({
            type: 'PUT',
            url: "/item/changelist",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({"listid": ul, "itemid": lastmovedliid, "projectid": lift.projectid}),
            success: function(json){

            },
            error: function(e){
                console.log(e.message);
            }
        });
		emitMessage('itemmove', {"finished": true, "id": lastmovedliid, "ul": ul, "position": $("li[data-id="+lastmovedliid+"]").index(), "projectid": lift.projectid});
	}
	var updatePositionInterval = 0;
	var lastmovedliid = 0;
	function updatePosition(event){
		lastmovedliid = $(event[0]).attr("data-id");
		var updateObj = $("[data-id="+lastmovedliid+"]");
		updateObj = $(updateObj[0])
		updatePositionInterval = setInterval(function(){
			//console.log(updateObj.offset().left + " : " + updateObj.offset().top + ", display = " + updateObj.css('display'));
			emitter = true;
			emitMessage('itemmove', {"id": lastmovedliid, "x": updateObj.offset().left, "y": updateObj.offset().top, "projectid": lift.projectid});
		}, 100);
	}

	function addItem(_this){
		$.ajax({
			type: "POST",
			url: "/item",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify({'listid': $(_this).parent().attr('data-id'), "projectid": lift.projectid, "position": ($(_this).parent().find("li").length-2)}),
			success: function(result){
				emitMessage('additem', {"listid": $(_this).parent().attr('data-id'), "item": result});
			},
			error: function(e){
				console.log(e.message);
			}
		});
	}

	lift.updateItem = function(){
		var item = {
				"id": $("#itemid").text(),
        		"name": $("#title").val(),
        		"text": $("#text").val(),
        		"points":$("#points").val(),
        		"views": (parseInt($("#views").text())+1),
        		"link": $("#item-link").val(),
        		"ownerid": $("#ownerid").val(),
        		"progress": $("#progress").val(),
        		"categoryid": $("#category").val(),
        		"projectid": lift.projectid
			};
		$.ajax({
			type: "PUT",
			url: "/item",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(item),
			success: function(result){
				//find item and update its property
				emitMessage('itemupdate', item);	
			},
			error: function(e){
				console.log(e.message);
			}
		});
	}

	lift.updateList = function(){
		var data = {
			name: $("#list-title").val(),
			ruler: $("#list-ruler").text(),
			id: $("#list-id").text(),
        	userid: ($("#list-userid").val() == "" ? 0 : $("#list-userid").val()),
        	link: $("#list-link").val(),
        	description: $("#list-text").val(),
        	position: 0,
        	projectid: lift.projectid,
        	removed: 0
		};
		$.ajax({
			type: "PUT",
			url: "/list",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			success: function(result){
				//find list and update its property	
				emitMessage('listupdate', data);
			},
			error: function(e){
				console.log(e.message);
			}
		});
	}

	lift.updateProject = function(){
		var data = {
			name: $("#project-name").val(),
			private: $("#project-private").val(),
			public: $("#project-public").val(),
        	projectid: lift.projectid
		};
		return;
		$.ajax({
			type: "PUT",
			url: "/list",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			success: function(result){
				//find list and update its property	
				emitMessage('projectupdate', data);
			},
			error: function(e){
				console.log(e.message);
			}
		});
	}

	lift.addItemToPage = function(data){
		var newitem = $("<li data-id='"+data.item.id+"'> New item </li>").on("click", function(){
                lift.lastClickedItem = data.item;
                modalitem.open();
            }); 
			var additem = $("ul[data-id='"+data.listid+"']").find('.additem');
			if(additem.length == 0){
            	$("ul[data-id='"+data.listid+"']").append(newitem);
			}else{
            	additem.before(newitem);
			}
	}

	lift.addListToPage = function(data){
		$('#lift-container').prepend('<ul data-id="'+data.id+'" class="'+lift.classname.replace(".","")+'">'+
                '<li class="listname">listname</li><li class="additem"></li></ul>').find('.listname').on("click", function(){
                    liftmodule.lastClickedList = data;
                    modallist.open();
                });
            //connect old lists to
            $(lift.classname).sortable({connectWith: [lift.classname], items: "li:not(.additem):not(.listname)", update: function(event, ui){
                organize(event);
                if (this === ui.item.parent()[0]) {
                    save();
                }
            }, placeholder: 'placeholder',
                            start: function(e, ui){
                            	if($(".lift").hasClass("vertical")){
                                	ui.placeholder.height(ui.item.height()+28);//40 to make up for padding
                            	}else{
                                	ui.placeholder.width(ui.item.width()+28);//40 to make up for padding
                            	}
                               	updatePosition(ui.item);
                            },
                        	stop: function(e, ui){
                        		clearInterval(updatePositionInterval); emitter = false; organize(event); emitFinished(event, ui);
                        	}}).find('.additem').off().on("click", function(){
					                addItem(this);
					            });
	}

	lift.updateListOnPage = function(data){
		console.log(data);
		$("ul[data-id='"+data.id+"']").find('.listname').text(data.name).off().on("click", function(){
			liftmodule.lastClickedList = data;
            modallist.open();
        });
	}

	lift.updateItemOnPage = function(data){
		
		$("li[data-id='"+data.id+"']")
			.addClass((data.progress == 100 ? 'finished' : ''))
			.removeClass((data.progress != 100 ? 'finished' : ''))
			.text(data.name).css("width", (data.points*20)+ "px")
			.attr("points", data.points)
			.attr("title", data.name).off()
			.on("click", function(){
	            liftmodule.lastClickedItem = data;
	            modalitem.open();
        	});
	}
	lift.removeList = function(){
		var data = {
			id: $("#list-id").text(),
			username: user.username,
			projectid: lift.projectid,
			identifier: '[data-id="'+$("#list-id").text()+'"]'
		};
		$.ajax({
			type: "DELETE",
			url: "/list/" + data.id,
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			success: function(result){
				//find list and update its property	
				emitMessage('remove', data);
			},
			error: function(e){
				console.log(e.message);
			}
		});
	}

	lift.removeItem = function(){
		var data = {
			id: $("#itemid").text(),
			username: user.username,
			projectid: lift.projectid,
			identifier: '[data-id="'+$("#itemid").text()+'"]'
		};
		$.ajax({
			type: "DELETE",
			url: "/item/" + data.id,
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			success: function(result){
				//find list and update its property	
				emitMessage('remove', data);
			},
			error: function(e){
				console.log(e.message);
			}
		});
	}

	lift.removeItemOnPage = function(data){
		if(data.projectid == lift.projectid){
			console.log(data.username + " removed: " + data.identifier);
			$(data.identifier).remove();
		}
	}

	return lift;
}());