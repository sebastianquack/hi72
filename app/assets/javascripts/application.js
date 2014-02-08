// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require owl-carousel/owl.carousel.min.js
//= require i18n
//= require i18n/translations

//= require_tree .

var NewBlob = function(data, datatype)
{
    var out;

    try {
        out = new Blob([data], {type: datatype});
        console.debug("case 1");
    }
    catch (e) {
        window.BlobBuilder = window.BlobBuilder ||
                window.WebKitBlobBuilder ||
                window.MozBlobBuilder ||
                window.MSBlobBuilder;

        if (e.name == 'TypeError' && window.BlobBuilder) {
            var bb = new BlobBuilder();
            bb.append(data);
            out = bb.getBlob(datatype);
            console.debug("case 2");
        }
        else if (e.name == "InvalidStateError") {
            // InvalidStateError (tested on FF13 WinXP)
            out = new Blob([data], {type: datatype});
            console.debug("case 3");
        }
        else {
            // We're screwed, blob constructor unsupported entirely   
            console.debug("Error");
        }
    }
    
    return out;
};

// Convert dataURL to Blob object
function dataURLtoBlob(dataURL) {
   // Decode the dataURL    
   var binary = atob(dataURL.split(',')[1]);
   // Create 8-bit unsigned array
   var array = [];
   for(var i = 0; i < binary.length; i++) {
       array.push(binary.charCodeAt(i));
   }
   // Return our Blob object
   return NewBlob(new Uint8Array(array), 'image/png');
}

var owl;

var canvas;
var context;
var stream_ref = null;
var video; 
var errBack = function(error) {
	console.log("Video capture error: ", error.code); 
};
var videoObj = { "video": true };
var frame_canvas;
var frame_context;

function init_webcam() {
    navigator.getUserMedia = navigator.getUserMedia       || 
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia    ||
                             navigator.msGetUserMedia;

    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia({video: true, audio: false}, function(localMediaStream) { 
        stream_ref = localMediaStream;
      video.autoplay = true;
      video.src = window.URL.createObjectURL(localMediaStream);
    }, function(error) { console.log(error); });
}

function stop_webcam() {
    if(stream_ref) {
        stream_ref.stop();
        stream_ref = null;
    }
}

var posterCreated = false;

// updates the hash depending on which poster is in the center
function updatePosterHash() {
    index = $('div.owl-item.active').index() + 1;
    if($('div.owl-item.active').length == 2) { // small mode
        index--;
    }
    console.log(posterCreated);
    if(index == 2 && posterCreated == false) { // poster generator
        window.location.hash = '';
        $('.sharing-menu').hide();
    } else {        
        posterId = $('div.owl-item:eq(' + index + ') li').data('poster-id');
        window.location.hash = '#poster/' + posterId;
        $('.sharing-menu').show();
        
        // Todo update sharing links here
        poster_url = window.location.href;
        image_url = 'http://' + window.location.host + $('div.owl-item.active:eq(1) li img').attr('src');
        console.log(image_url);

        $('#share-link').attr('href', poster_url);
        $('#share-link').off('click');
        
        $('#share-facebook').off('click');
        $('#share-facebook').on('click', function(event) {
            
            
            
           
          event.preventDefault();
          
          
          /*
      	  window.open(
      	      
'https://www.facebook.com/sharer/sharer.php?s=100&p[url]='+encodeURIComponent(poster_url)+'&p[images][0]='+encodeURIComponent(image_url)+'&p[summary]='+encodeURIComponent(I18n.t("social_media_prompt")), 
      	      'facebook-share-dialog', 
      	      'width=626,height=436'); 
          
         */
         
          FB.ui(
               {
                method: 'feed',
                name: '72 HOUR INTERACTIONS',
                caption: 'A World Championship of Gameful Architecture',
                description: (
                   I18n.t("social_media_prompt")
                ),
                link: poster_url,
                picture: image_url
               },
               function(response) {
                 if (response && response.post_id) {
                   console.log('Post was published.');
                 } else {
                   console.log('Post was not published.');
                 }
               }
             );
          
          
          
          
        });

        $('#share-twitter').off('click');
        $('#share-twitter').on('click', function(event) {
           
           
          event.preventDefault(); 
      	  window.open(
      	      'http://twitter.com/share?text='+encodeURIComponent(I18n.t("social_media_prompt"))+'&url='+encodeURIComponent(poster_url), 
      	      'twitter-share-dialog', 
      	      'width=626,height=436');            
        });
    }
}

function init_poster_generator() {

    var step = 1;

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

	// setup video
    video = null;
	video = document.createElement("video");
	video.width = canvas.width - 20;
	video.height = canvas.height - 20;

	// setup video effects
	frame_canvas = null
    frame_canvas = document.createElement('canvas');
	frame_canvas.width = canvas.width;
	frame_canvas.height = canvas.height;

	frame_context = frame_canvas.getContext("2d");
	// flip video frame context for mirror effect
	frame_context.translate(video.width, 0);
	frame_context.scale(-1, 1);	    

	var disaster_canvas = document.createElement('canvas');
	disaster_canvas.width = canvas.width;
	disaster_canvas.height = canvas.height;
	var disaster_context = disaster_canvas.getContext("2d");

	var mask_offset_x = 0;
	var mask_offset_y = 0;

	var background_id = 0;
	var disaster_id = 0;
	var silhouette_id = 1;

	// load layer images
	var background_images = [];
	var disaster_images = [];
	var silhouette_images = [];
	var mask_images = [];

	function create_image(path) {
		var obj = new Image();
		obj.src = 'assets/' + path;
		return obj;
	}

	background_images[1] = create_image('cities/hagen_transparent.png');
	background_images[2] = create_image('cities/witten_transparent.png');
	background_images[3] = create_image('cities/wetter_transparent.png');
	background_images[4] = create_image('cities/herdecke_transparent.png');
	background_images[5] = create_image('cities/hattingen_transparent.png');

	disaster_images[1] = create_image('disasters/blitz.png');
	disaster_images[2] = create_image('disasters/feuer.png');
	disaster_images[3] = create_image('disasters/traffijam_klkl.png');
	disaster_images[4] = create_image('disasters/regen.jpg');
	disaster_images[5] = create_image('disasters/totallove2_kl.png');

	mask_images[2] = create_image('silhouettes/xray_silo.png');
	mask_images[3] = create_image('silhouettes/Bauhelm_silo.png');
	mask_images[4] = create_image('silhouettes/Hammer_silo.png');
	mask_images[5] = create_image('silhouettes/bart_silo.png');
	mask_images[6] = create_image('silhouettes/megafon_silo.png');
	mask_images[7] = create_image('silhouettes/taube_silo.png');

	silhouette_images[2] = create_image('silhouettes/xray_kl.png');
	silhouette_images[3] = create_image('silhouettes/Bauhelm_kl.png');
	silhouette_images[4] = create_image('silhouettes/Hammer_kl.png');
	silhouette_images[5] = create_image('silhouettes/bart_frei_kl.png');
	silhouette_images[6] = create_image('silhouettes/megafon_kl.png');
	silhouette_images[7] = create_image('silhouettes/taube_kl.png');

    logo_image = create_image('plakatlogo.png');

	// calculate and display live video effects
	function apply_effects() {

        if($('#generator').css('display') == 'none') {
            stop_webcam();
            console.log('generator off');
            return;
        }
        
		// copy video frame
        // see http://stackoverflow.com/questions/18580844/firefox-drawimagevideo-fails-with-ns-error-not-available-component-is-not-av
        try {
            frame_context.drawImage(video, 0, 0);
        } catch (e) {
           if (e.name == "NS_ERROR_NOT_AVAILABLE") { // catch bug that happens in firefox
             //setTimeout(drawVideo, 0);
        } else {
             throw e;
           }
        }

		// clear output canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
		
		if(silhouette_id > 1) {	
			// prepare masking effect
			context.drawImage(mask_images[silhouette_id], 10 + mask_offset_x, 10 + mask_offset_y);
			context.globalCompositeOperation = 'source-atop';
		
			// add video image to canvas
			context.drawImage(frame_canvas, 5, 200);
			
			context.globalCompositeOperation = 'source-over';
			context.drawImage(silhouette_images[silhouette_id], 10 + mask_offset_x, 10 + mask_offset_y);
		}
        		
		// add city		
		if(background_id > 0) {
			context.globalCompositeOperation = 'destination-over';
			context.drawImage(background_images[background_id], 10, 10);
		}
		
        // add video image to canvas under everything as godzilla mode
        if(silhouette_id == 1) {	
            context.globalCompositeOperation = 'destination-over';
            context.drawImage(frame_canvas, 10, 10);			
        }
		
		if(disaster_id == 3) {
			context.globalCompositeOperation = 'source-over';
			context.drawImage(disaster_images[disaster_id], 0, 0);
		} else if(disaster_id == 1) {
			disaster_context.drawImage(disaster_images[disaster_id], 0, 0);
			disaster_context.blendOnto(context,'lighten');
		} else if(disaster_id == 2) {
			disaster_context.drawImage(disaster_images[disaster_id], 0, 0);
			disaster_context.blendOnto(context,'overlay');
		} else if(disaster_id == 4) {
			disaster_context.drawImage(disaster_images[disaster_id], 0, 0);
			disaster_context.blendOnto(context,'multiply');		    
		} else if(disaster_id == 5) {
            disaster_context.clearRect(0, 0, canvas.width, canvas.height);
			disaster_context.drawImage(disaster_images[disaster_id], 0, 0);
			disaster_context.blendOnto(context,'screen');		    
		}
		                    
        // add logo        
		context.globalCompositeOperation = 'source-over';
		context.drawImage(logo_image, 10, 10);
        
        if(step == 6) {
            context.textAlign = 'center';
            var x = canvas.width / 2;
            context.textBaseline = 'middle';

            context.globalCompositeOperation = 'source-over';

            if($('#title').val() != 'Title' && $('#title').val() != 'Titel')  {
                context.fillStyle = "#fff"; //$('#title').css('color');
                context.font = "50px Steelfish"; //$('#titl"e').css('font');
                context.fillText($('#title').val(), x, 450);
            }

            if($('#subtitle').val() != 'Subtitle' && $('#subtitle').val() != 'Untertitel') {
                context.fillStyle = "#fff"; //$('#subtitle').css('color');
                context.font = "30px Steelfish"; //$('#subtitle').css('font');
                context.fillText($('#subtitle').val(), x, 510);
            }
        }
        
	    // Repeat at 30 fps
	    setTimeout(apply_effects, 1000/30);
	}
	
    apply_effects();
    	
	// setup head tracking
    /*
	var htracker = new headtrackr.Tracker({ui : false});
	var tracking_canvas = document.createElement("canvas");
	tracking_canvas.width = canvas.width;
	tracking_canvas.height = canvas.height;
	
	htracker.init(video, tracking_canvas);
	htracker.start();
    */
	
	var face_tracking_on = false;
	// when face moves change offsets of mask and silhouette
	/*
	document.addEventListener('facetrackingEvent', 
	  function (event) {
		if(face_tracking_on) {
			mask_offset_x = video.width - event.x + 120;
		}
	  }
	);
	*/
	
    function load_step() {
        if(step == 1) {
            $('#prev-step').hide();            
        } else {
            $('#prev-step').show();            
        }
        if(step == 6) {
            $('#next-step').hide();    
        } else {
            $('#next-step').show();    
        }

        $('.step-controls').removeClass('active-step');
        $('#step-controls-' + step).addClass('active-step');
        
        $('#step-numbers div').removeClass('active-step');
        $('#step-number-' + step).addClass('active-step');
        
        if(step == 3) { 
        	/* this is also taken over by headtracking library, when used */
            if(!stream_ref) {
                init_webcam();                
            }            
        }
        
        if(step == 5) {
            $('#titles').show();
            $('#title').focus();
        } else {
            $('#titles').hide();            
        }
    }
    load_step();
    
    // step controls     
    $('#next-step').off().click(function() {
        if(step < 6) {
            step++;
        }
        load_step();
    });
    
    $('#prev-step').off().click(function() {        
        if(step > 1) {
            step--;
        } 
        load_step();
    });
    $('#step-numbers div').off().click(function(event) {
      step = $(event.target).attr('id').substr($(event.target).attr('id').length - 1);
      load_step();
    });
        
	// layer selectors
	$("#select-background").val(0);
	$('#select-background').off().change(function() {
		background_id = $('#select-background').val();
	});

	$("#select-disaster").val(0);
	$('#select-disaster').off().change(function() {
		disaster_id = $('#select-disaster').val();
	});
	
	$("#select-silhouette").val(1);
	$('#select-silhouette').off().change(function() {
		silhouette_id = $('#select-silhouette').val();		
	});

	$('#snap').show();
	$('#clear').hide();
	
	$('#snap').off().click(function() {
		face_tracking_on = false;		
		video.pause();		
		$('#snap').hide();
		$('#clear').show();
	});
	
	$('#clear').off().click(function() {
		$('#clear').hide();		
		$('#snap').show();
    	video.play();
		face_tracking_on = true;			
	});
		
    $('#submit').show();
    $('.wait').hide();
	$('#submit').off().click(function() {
				
        $('#submit').hide();
        $('.wait').show();
                
		var dataURL = canvas.toDataURL('image/png');
				
	    // Get our file
	    var file = dataURLtoBlob(dataURL);
	    // Create new form data
	    var fd = new FormData();
	    // Append our Canvas image file to the form data
	    fd.append("image", file, "poster.png");
	    // And send it
	    $.ajax({
	        url: "/poster_submit",
	        type: "POST",
	        data: fd,
	        processData: false,
	        contentType: false,
	     }).done(function(data) {

			// dump new item into generator's place if it's there
			if($('#mainframe').length > 0) {
				$('#mainframe').parent().replaceWith(data);				
                posterCreated = true;
                console.log('foo' + posterCreated);
			} else { // if not add it in first place and move caroussel
				owl.addItem(data, 1);
				owl.jumpTo(0);
			}

            updatePosterHash();  	
            video.pause();
			$('#posters').show();
	 		$('#generator').hide();
			$('li a.generator-link').removeClass('active');
			$('li a.gallery-link').addClass('active');
			$('.prev, .next').show();
						
		 });	
	});
}		

var positionOwlItem = function() {
	if ($(window).width() > 900 && $(window).width() <= 1200) {
		//console.log($(".owl-item").first().width());
		w = Math.round($(".owl-item").first().width() / 2);
		$(".owl-item").css("left", w + "px");
	}
	else {
		$(".owl-item").css("left","0");
	}
}

$(document).ready(function() {

	$("#carousel").owlCarousel({
		//responsiveBaseWidth: "#carousel-width",
		afterUpdate: positionOwlItem,
		afterInit: positionOwlItem,
		navigation:false,
		pagination:false,
		items: 3,
    	itemsDesktop : [1200,2], 
      	itemsDesktopSmall : [900,1],
      	itemsTablet: [600,1],
      	itemsMobile : false, // itemsMobile disabled - inherit from itemsTablet option		
        addClassActive : true,
        afterMove: updatePosterHash
	});
	owl = $("#carousel").data('owlCarousel');
           	        
	$('.navigation li a').click(function(event) {
		if($('#front-cover').css('display') == 'block') {
			$('#front-cover').fadeOut(800);
			$('#content').show();
		}
		
		$('.navigation li a').removeClass('active');
		$(event.target).addClass('active');
		
		$('.prev, .next').hide();
	});
			
	$('#front-cover').click(function() {
		$('#front-cover').fadeOut(800);
		$('#posters').show();
		$('#content').show();
		$('li a.gallery-link').addClass('active');
	});

	$('.gallery-link').click(function(event) {
		event.preventDefault();
		$('#posters').show();
		$('#generator').hide();
		$('.prev, .next').show();
        updatePosterHash();
	});

	$('.generator-link').click(function(event) {	
		event.preventDefault();

		if($('#generator').css('display') == 'none') {
            $('#posters').hide();
    		$('#generator').show();
			init_poster_generator();
		}
		$('.prev, .next').hide();				
		$('.navigation li a').removeClass('active');
		$('nav li a.generator-link').addClass('active');
        window.location.hash = '';
        $('.sharing-menu').hide();
	});
	
	$('.front-link').click(function() {
		$('#front-cover').fadeIn();
		$('#posters').hide();
		$('#content').hide();
		$('.navigation li a').removeClass('active');
        window.location.hash = '';
	});

	$('a').smoothScroll({
		offset: -100
	});

	$('.prev').click(function(event) {
		event.preventDefault();
		owl.prev();   // Go to previous slide	
        updatePosterHash();
	});
	
	$('.next').click(function(event) {
		event.preventDefault();
		owl.next();   // Go to next slide
        updatePosterHash();
	});
	
    $('#new_user').on('ajax:success', function(xhr, data, status) {
        alert(data.msg);
        $('#new_user input[type="email"]').val('');
    });

    $('#new_site').on('ajax:success', function(xhr, data, status) {
        alert(data.msg);
        $('#new_site input[type="text"], #new_site input[type="email"], #new_site textarea').val('');
    });
    
    
    // move owl to requested poster        
    // check if user wants a poster
    if(window.location.hash.indexOf('#poster/') == 0) { 
        // get the poster id from the hash
        posterId = window.location.hash.substring('#poster/'.length); 
        
        // get index for poster
        index = -1;
        li = $('li.item.poster[data-poster-id="' + posterId + '"]');
        if(li.length >= 1) {
            index = li.parent().index();
        }
        // jump to that index
        if(index >= 0) {
            
            if($('div.owl-item.active').length == 2) { // small mode
                index++;
            }
            
            owl.jumpTo(index - 1);        
            updatePosterHash();
            
            // show gallery
    		$('#front-cover').hide();
    		$('#posters').show();
    		$('#content').show();
    		$('li a.gallery-link').addClass('active');
        }
    } else {
        if($('div.owl-item.active').length == 2) { // small mode
            owl.jumpTo(2);                    
        } else {
            owl.jumpTo(1);                    
        }
    }
    
});

$(window).resize(positionOwlItem);
