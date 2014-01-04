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
//= require turbolinks
//= require owl-carousel/owl.carousel.min.js

//= require_tree .

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
   return new Blob([new Uint8Array(array)], {type: 'image/png'});
}

function init_poster_generator() {

	var canvas = document.getElementById("canvas");
	var	context = canvas.getContext("2d");

	// setup video
	var	video = document.createElement("video");
	video.width = canvas.width;
	video.height = canvas.height;

	/* this is taken over by headtracking library
	var videoObj = { "video": true };
	var errBack = function(error) {
		console.log("Video capture error: ", error.code); 
	};

	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			video.src = stream;
			video.play();
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
		}, errBack);
	}
	else if(navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function(stream){
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, errBack);
	}
	*/

	// setup video effects
	var frame_canvas = document.createElement('canvas');
	frame_canvas.width = canvas.width;
	frame_canvas.height = canvas.height;

	var	frame_context = frame_canvas.getContext("2d");
	// flip video frame context for mirror effect
	frame_context.translate(video.width, 0);
	frame_context.scale(-1, 1);	    

	var mask_offset_x = 0;
	var mask_offset_y = 0;

	var background_id = 0;
	var disaster_id = 0;
	var silhouette_id = 0;

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

	background_images[1] = create_image('HG1_transparent.png');

	disaster_images[1] = create_image('blitz.png');

	mask_images[2] = create_image('Bauhelm_silo.png');
/*	mask_images[3] = create_image('Hammer_silo.png');
	mask_images[4] = create_image('xray_silo.png');*/

	silhouette_images[2] = create_image('Bauhelm_kl.png');
/*	silhouette_images[3] = create_image('Hammer_kl.png');
	silhouette_images[4] = create_image('xray_kl.png');*/

	// calculate and display live video effects
	function apply_effects() {
	    if( video.paused || video.ended ) {
	        return;
	    }
		// copy video frame
		frame_context.drawImage(video, 0, 0);

		// clear output canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
	   	context.globalCompositeOperation = 'source-over';

		if(silhouette_id > 1) {	
			// prepare masking effect
			context.drawImage(mask_images[silhouette_id], mask_offset_x, mask_offset_y);
			context.globalCompositeOperation = 'source-atop';
		
			// add video image to canvas
			context.drawImage(frame_canvas, 0, 200);
			
			context.globalCompositeOperation = 'destination-over';
			context.drawImage(silhouette_images[silhouette_id], mask_offset_x, mask_offset_y);
		}
		
		if(disaster_id > 0) {
			context.globalCompositeOperation = 'destination-over';
			context.drawImage(disaster_images[disaster_id], 0, 0);
		}
				
		if(background_id > 0) {
			context.globalCompositeOperation = 'destination-over';
			context.drawImage(background_images[background_id], 0, 0);
		}
		
		if(silhouette_id == 1) {	
			// add video image to canvas under everything as godzilla mode
			context.globalCompositeOperation = 'destination-over';
			context.drawImage(frame_canvas, 0, 0);			
		}

	    // Repeat at 30 fps
	    setTimeout(apply_effects, 1000/30);
	}
	
	$(video).on('canplaythrough', function(){
	    apply_effects();
	});
	
	// setup head tracking
	var htracker = new headtrackr.Tracker({ui : false});
	var tracking_canvas = document.createElement("canvas");
	tracking_canvas.width = canvas.width;
	tracking_canvas.height = canvas.height;
	
	htracker.init(video, tracking_canvas);
	htracker.start();
	
	var face_tracking_on = false;
	
	// when face moves change offsets of mask and silhouette
	document.addEventListener('facetrackingEvent', 
	  function (event) {
		if(face_tracking_on) {
			mask_offset_x = video.width - event.x + 120;
		}
	  }
	);
	
	// layer selectors
	$('#select-background').change(function() {
		background_id = $('#select-background').val();
	});

	$('#select-disaster').change(function() {
		disaster_id = $('#select-disaster').val();
	});
	
	$('#select-silhouette').change(function() {
		silhouette_id = $('#select-silhouette').val();		
	});
	
	$('#snap').click(function() {
		face_tracking_on = false;		
		video.pause();
		
        context.textAlign = 'center';
        var x = canvas.width / 2;
        context.textBaseline = 'middle';

		context.globalCompositeOperation = 'source-over';

		context.fillStyle = $('#title').css('color');
		context.font = $('#title').css('font');
		context.fillText($('#title').val(), x, 325);

		context.fillStyle = $('#subtitle').css('color');
		context.font = $('#subtitle').css('font');
		context.fillText($('#subtitle').val(), x, 370);

		$('#titles').hide();
		$('.selectors').hide();
		$('#snap').hide();
		$('#clear').show();
		$('#submit').show();		
	});
	
	$('#clear').click(function() {
		$('#clear').hide();
		$('#submit').hide();
		$('.selectors').show();		
		$('#snap').show();
		
		video.play();
		face_tracking_on = true;			
		apply_effects();
		$('#titles').show();
	});
	
	
	$('#submit').click(function() {
				
		var dataURL = canvas.toDataURL('image/png');
				
	    // Get our file
	    var file = dataURLtoBlob(dataURL);
	    // Create new form data
	    var fd = new FormData();
	    // Append our Canvas image file to the form data
	    fd.append("image", file);
	    // And send it
	    $.ajax({
	        url: "/poster_submit",
	        type: "POST",
	        data: fd,
	        processData: false,
	        contentType: false,
	     }).done(function(data) {
			 $('#mainframe').html(data);
		 });	



	});
}		

var positionOwlItem = function() {
	if ($(window).width() > 900 && $(window).width() <= 1200) {
		//console.log($(".owl-item").first().width());
		w = Math.round($(".owl-item").first().width() / 2);
		$(".owl-item").css("left", -w + "px");
	}
	else {
		$(".owl-item").css("left","0");
	}
}


$(document).ready(function() {

	//var navheight = jQuery('#navigation').height();
	//jQuery('#front').css('padding-top',navheight+'px');

	var logo_position = $('nav img.small-logo').offset().top;
	$('nav img.small-logo').css('visibility', 'hidden');
	$('nav').css('background-color', 'transparent');
	
	var logo_scroll_origin = $('#posters img.small-logo').offset().top; //get the offset top of the element

	$(document).scroll(function() {		
		current_logo_position = logo_scroll_origin  - $(window).scrollTop();
		if(current_logo_position > logo_position) { // front page
			$('nav img.small-logo').css('visibility', 'hidden');
			$('#posters img.small-logo').css('visibility', 'visible');
			$('nav').css('background-color', 'transparent');

			$('#canvas_outline').css('visibility', 'visible');
			$('#mainframe canvas').css('border', 'none');

		} else { // later
			$('nav img.small-logo').css('visibility', 'visible');
			$('#posters img.small-logo').css('visibility', 'hidden');
			$('nav').css('background-color', '#fff');

			$('#mainframe canvas').css('border', 'dashed 1px #f0f');
			$('#canvas_outline').css('visibility', 'hidden');
		}
	});


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
      	itemsMobile : false // itemsMobile disabled - inherit from itemsTablet option		
	});
	
	$('a').smoothScroll({
		offset: -80
	});
	
	init_poster_generator();
	
});

$(window).resize(positionOwlItem);