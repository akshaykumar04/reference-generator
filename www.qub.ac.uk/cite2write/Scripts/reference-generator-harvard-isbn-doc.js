//spaghetti
//spaghetti
//global variables bad
var undoStack = [];
function initRef() {
    $(".panel").css("display", "inline");
    $("#slide").codaSlider({continuous:!1, dynamicArrows:!1, slideEaseDuration:1500, slideEaseFunction:"easeOutExpo", autoHeightEaseFunction:"easeOutBounce"});
    $("#submit").button().click(generateReference);
    $("#clear").button().click(clearForm);
    $("#undo").button().click(undo).hide(); 
	$("#flashbuttondiv").click(function () {
    $('<form action="doc.php" method="POST"/>')
        .append($('<input type="hidden" name="string" value="' + $("#outputtext").html() + '">'))
        .appendTo($(document.body))
        .submit();
});
	
	$(function() {
        $( "#dialog-form" ).dialog({
            autoOpen: false,
            resizable:false,
            width:365,
            height:350,
            modal: true,
            buttons: {
                "Search":
                    function () {
                    $(":button:contains('Search')").prop("disabled", true).addClass("ui-state-disabled");
                    $('#isbnbox').val($('#isbnbox').val().replace(/[^\dxX]/g, ''));
                    isbn = $('#isbnbox').val();			
					var tab = getCurrentTab();
					tab.find('input').val("");
					var url =  "http://openlibrary.org/api/books?bibkeys=ISBN:" + isbn + "&jscmd=data&callback=?";					
					jQuery.getJSON(url, null, function(data){
					    $('#attribution').children().fadeOut();
						var dataString = 'ISBN:'+isbn;
						if(typeof data[dataString] == 'undefined' || (typeof(data[dataString].authors) == "undefined"))
						{						
							doGoogleSearch();
							return;
						}													
						var tab = getCurrentTab();
						tab.find('.author').val(typeof(data[dataString].authors) != "undefined" ? getOpenLibAuthorString(data[dataString].authors) : "");
						tab.find('.title').val(data[dataString].title + (typeof(data[dataString].subtitle) != "undefined" ? ": " + data[dataString].subtitle : ""));
						tab.find('.year').val((data[dataString].publish_date).match(/\d{4}/)[0]);
						tab.find('.pubname').val(typeof(data[dataString].publishers[0].name)!= "undefined" ? data[dataString].publishers[0].name: "");
						tab.find('.place').val(typeof(data[dataString].publish_places) != "undefined" ? data[dataString].publish_places[0].name : "");											
						$('#attribution').html('<span>Information for <i><a href = "' + data[dataString].url + '">' + data[dataString].title + '</a></i> provided by <a href="http://www.openlibrary.org">Open Library.</a>' + (typeof (data[dataString].cover) != "undefined" ? '<br/><br/><a href = "' + data[dataString].url + '"><img style="width:128px;margin-left:25px;box-shadow: 0 0 10px 4px #aaa;"  src="' + data[dataString].cover.medium + '"></a></span>' : ""));
						$('#isbnbox').val('');
						$(":button:contains('Search')").prop("disabled", false).removeClass("ui-state-disabled");
						$('#dialog-form').dialog("close");
						$('#attribution').children().fadeIn();
					})
					
					function doGoogleSearch()
					{
						url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn + '&callback=?&key=AIzaSyC7NgGiwtp0w8swpQmVJYf7kP55U_ix9BM';
						jQuery.getJSON(url, null, function(data){
						
							if(data.totalItems != 0)
							{
								jQuery.getJSON('https://www.googleapis.com/books/v1/volumes/' + data.items[0].id + '?projection=full&key=AIzaSyC7NgGiwtp0w8swpQmVJYf7kP55U_ix9BM', null, function (data) {
									
									var tab = getCurrentTab();
									tab.find('.author').val(getAuthorString(data.volumeInfo.authors));
									tab.find('.title').val(data.volumeInfo.title + (typeof(data.volumeInfo.subtitle) != "undefined" ? ": " + data.volumeInfo.subtitle : ""));
									tab.find('.year').val((data.volumeInfo.publishedDate).match(/\d{4}/)[0]);
									tab.find('.pubname').val(data.volumeInfo.publisher);
									$(":button:contains('Search')").prop("disabled", false).removeClass("ui-state-disabled");
									$('#attribution').html('<span>Information for <i><a href = "' + data.volumeInfo.canonicalVolumeLink +
                                        '">' + data.volumeInfo.title +
                                        '</a></i> provided by <a href="http://books.google.com">Google Books</a><br/><br/>' +
                                        (typeof data.volumeInfo.imageLinks != "undefined" ? '<a href="' + data.volumeInfo.canonicalVolumeLink + '" ><img style="margin-left:25px;box-shadow: 0 0 10px 4px #aaa;"  src="' + data.volumeInfo.imageLinks.thumbnail + '" /></a><br/>' : '') + '<a href="http://www.google.com"><img style="margin-left:60px;" src="http://books.google.com/googlebooks/images/poweredby.png" alt="Powered by Google" /></a>');
									$('#isbnbox').val('');
									$('#dialog-form').dialog("close");
									$('#attribution').children().fadeIn();
								});
							}
							else{
								alert("Book not found.");
								$(":button:contains('Search')").prop("disabled", false).removeClass("ui-state-disabled");
								$('#attribution').html('<span>ISBN search is powered by <a href="http://books.google.com/">Google Books</a> and <a href="http://openlibrary.org/">Open Library</a></span>');
								return;
							}				
						});					
					}				
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    });
    $("#isbnbutton").button().click(function(){
        $("#dialog-form").dialog("open");
    })
    $("#output").button().click(function () {
        outputList("#outputdiv")
    }).hide();
    $("#outputdiv").hide();
    $("#radio").buttonset();
    initializeTips();
    if (localStorage) {
        for (i = 0; i < localStorage.length; i++) {
            var a =
                localStorage.getItem(i);
            $("#referencelist").append(a)
        }
        a = $("li.reflistitem");
        for (i = 0; i < a.length; i++)addDelButton($(a[i]));
        0 < a.length && $("#output").slideDown(500)
    }
}

function getAuthorString(a){
	var str = "";
	for(var i = 0; i <a.length; i++)
	{
		str += a[i];
		if(i != a.length-1)
		{
			str += ", "
		}					
	}
	return str;
}

function getOpenLibAuthorString(a){
	var str = "";
	for(var i = 0; i <a.length; i++)
	{
		str += a[i].name;
		if(i != a.length-1)
		{
			str += ", "
		}					
	}
	return str;
}


// function initializeFlashButtons() {
//     0 == $("#flashbuttondiv").children("object").length && swfobject.hasFlashPlayerVersion("10") && $("#flashbuttondiv").downloadify({filename:"References.html", data:function () {
//         return $("#outputtext").html()
//     }, onComplete:function () {
//         alert("File Saved")
//     }, onCancel:function () {
//     }, onError:function () {
//         alert("You must put something in the File Contents or there will be nothing to save!")
//     }, swf:"downloadify.swf", downloadImage:"download.png", width:24, height:32, transparent:!0, append:!1})
// }
function clearForm() {
    tab = getCurrentTab();
    inputs = tab.children("p").children("input");
    inputs.each(function () {
        $(this).animate({color:"#fff"}, 400, "easeOutQuad", function () {
            $(this).val("").css("color", "#000")
        })
    })
}
function outputList() {
    var a = [];
    $(".reflisttext").each(function () {
        a.push($(this).html())
    });
    var a = a.sort(function (a, b) {
        return a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0
    }), b = $("#outputdiv").parent("div").outerHeight(!0) + "px", c = $("#outputdiv").outerHeight(!0);
    $("#outputdiv").parent("div").css("min-height", b);
    $("#outputdiv").slideUp(500, "easeInExpo", function () {
        $(this).children("p").html("");
        for (i = 0; i < a.length; i++)$("#outputdiv").children("p").append(a[i] + "<br />");
        $("#outputdiv").slideDown(500,
            "easeOutQuad", function () {
               // initializeFlashButtons();
                var a = $("#outputdiv").outerHeight(!0), b = i;
                c > a && (b = $("#outputdiv").outerHeight(!0) - (c - a), $("#outputdiv").parent("div").animate({"min-height":b}, 1500, "easeInOutQuint"))
            })
    })
}
function undo() {
    var a = undoStack.pop();
    0 == undoStack.length && $(this).slideUp(400);
    $("#referencelist").append(a);
    a.children("div").children("button").show(400);
    a.show(400, "easeOutExpo", function () {
        addDelButton($(this));
        1 <= $("li.reflistitem").length && "none" == $("#output").css("display") && $("#output").slideDown(500)
    })
}
function getCurrentTab(a) {
    var b = $('a[class="current"]').attr("href").charAt(1);
    return"index" == a ? b : $("#" + b).children("div")
}
function generateReference() {
    var a = [];
    getCurrentTab().children("p").each(function () {
        var b = $(this).children("input"), d = b.attr("class"), b = b.val(), b = b.replace(/</g, "&lt;"), b = b.replace(/>/g, "&gt;"), b = b.replace(/&/g, "&amp;");
        a[d] = b
    });
    reference = getReference(a);
    var b = $('<li class="reflistitem" ></li>').html($('<div class="reflisttext"></div>').html(reference)).hide();
    $("#referencelist").append(b);
    b.show(400, "easeOutExpo", function () {
        addDelButton($(this));
        "none" == $("#output").css("display") && $("#output").slideDown(500)
    })
}
function updateLocalStorage() {
    localStorage.clear();
    if (localStorage) {
        var a = $("li.reflistitem").clone();
        for (i = 0; i < a.length; i++)$(a[i]).children("div.del").remove(), localStorage.setItem(i, a[i].outerHTML)
    }
}
function addDelButton(a) {
    var b = $("<button>Delete</button>").button();
    b.click(deleteItem);
    b = $('<div class="del"></div>').append(b).hide();
    a.append(b);
    b.show(400, function () {
        updateLocalStorage()
    })
}
function deleteItem() {
    $(this).slideUp(150, "linear", function () {
        $(this).remove()
    });
    var a = $(this).parent("div").parent("li");
    undoStack.push(a);
    $("#undo").slideDown(400);
    $(this).parent("div").parent("li").slideUp("slow", "easeInOutExpo", function () {
        1 == $("li.reflistitem").length && $("#output").slideUp(500);
        $(this).remove();
        updateLocalStorage()
    })
}
function sortArray(a) {
    $(a).children("li").get()
}
function initializeTips() {
    $(".authorbox").each(function () {
        $(this).qtip({content:"Surname, Initial(s)<br/ >USE PUNCTUATION <br /> eg. Smith, S.A., Jones, P. and Forbes, A.", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".titlebox").each(function () {
        $(this).qtip({content:"Only capitalise the first letter of the first word and proper nouns", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".pagebox").each(function () {
        $(this).qtip({content:"e.g. 67-82", position:{my:"bottom left",
            at:"top left", target:$(this)}})
    });
    $(".urlbox").each(function () {
        $(this).qtip({content:"URL<br/>e.g. http://www.fullwebaddress.com", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".datebox").each(function () {
        $(this).qtip({content:"Date<br/>e.g. 2nd September 2010", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".jtitlebox").each(function () {
        $(this).qtip({content:"Capitalise the first letter of every word.", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".editionbox").each(function () {
        $(this).qtip({content:"Leave blank if 1st<br/>e.g. 2nd",
            position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".daybox").each(function () {
        $(this).qtip({content:"e.g. 30th", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".monthbox").each(function () {
        $(this).qtip({content:"e.g. August", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".ebox").each(function () {
        $(this).qtip({content:"e.g. Ebrary", position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $(".singlepagebox").each(function () {
        $(this).qtip({content:"e.g. 18",
            position:{my:"bottom left", at:"top left", target:$(this)}})
    });
    $("div.nav").each(function () {
        $(this).qtip({content:"Choose a referencing style.", position:{my:"bottom left", at:"top left", target:$(this)}})
    })
}
;