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
//= require headtrackr.js
//= require_tree .

// Converts canvas to an image
function convertCanvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}

function show_video() {
	$('#silhouette').show();
	$('#video').show();
	$('#silhouette').show();	
}

function hide_video() {
	$('#silhouette').hide();
	$('#video').hide();
	$('#silhouette').hide();	
}

face_tracking_on = true;

// Put event listeners into place
$(document).ready(function() {

	// Grab elements, create settings, etc.
	var video = document.getElementById("video"),
		videoObj = { "video": true },
		htracker = new headtrackr.Tracker({ui : false}),
		trackingCanvas = document.getElementById("tracking-canvas"),
		photoCanvas = document.getElementById("photo-canvas"),
		errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};

	// setup events

	// layer selectors
	$('#select-background').change(function() {
		if($('#select-background').val() == "none") {
			$('#background').css('background-image', 'none');
		} else {
			image_path = '/assets/'+$('#select-background').val()+'_transparent.png';
			$('#background').css('background-image', 'url('+image_path+')');
		}
	});

	$('#select-disaster').change(function() {
		if($('#select-disaster').val() == "none") {
			$('#disaster').css('background-image', 'none');
		} else {
			image_path = '/assets/'+$('#select-disaster').val()+'.png';
			$('#disaster').css('background-image', 'url('+image_path+')');
		}
	});
	
	$('#select-silhouette').change(function() {
		
		if($('#select-silhouette').val() == 'none') {

			hide_video();
			$('#background').css('z-index', '5');
			$('#disaster').css('z-index', '6');

		} else if($('#select-silhouette').val() == 'transparent') {
			
			show_video();
			$('#video').removeClass('mask');
			$('#video').css('-webkit-mask', 'none');
			$('#photo-canvas').removeClass('mask');
			$('#photo-canvas').css('-webkit-mask', 'none');

			$('#background').css('z-index', '5');
			$('#disaster').css('z-index', '6');
			$('#silhouette').hide();
						
		} else {
				
			show_video();
			if(!$('#video').hasClass('mask')) {

				$('#video').addClass('mask');
				$('#photo-canvas').addClass('mask');
				
				$('#background').css('z-index', '0');
				$('#disaster').css('z-index', '1');
				$('#silhouette').show();
			}
			
			image_path = '/assets/'+$('#select-silhouette').val()+'.png';
			$('#silhouette').css('background-image', 'url('+image_path+')');

			mask_path = '/assets/'+$('#select-silhouette').val()+'_mask.png';
			$('.mask').css('-webkit-mask-image', 'url('+mask_path+')');
		}
		
	});

		
	// Trigger photo take
	$('#snap').click(function() {
		face_tracking_on = false;		
		video.pause();
		$('.poster-title').css('background-color', 'rgba(0,0,0,0.0)');
		
		/*
		hide_video();
									
		var photo_context = $('#photo-canvas')[0].getContext("2d");

		// fill background with black
		photo_context.rect(0,0,640,480);
		photo_context.fill();

		// render background on canvas
		var background = new Image();		
		background.src = $('#background').css('background-image').replace(/^url|[\(\)]/g, '');
		// Make sure the image is loaded first otherwise nothing will draw.
		background.onload = function(){
		    photo_context.drawImage(background,0,0);   
		};
		
		// render disaster on canvas
		var disaster = new Image();
		disaster.src = $('#disaster').css('background-image').replace(/^url|[\(\)]/g, '');
		// Make sure the image is loaded first otherwise nothing will draw.
		disaster.onload = function(){
		    photo_context.drawImage(disaster,0,0);   
		};
		
		// render silhouette on canvas
		var silhouette = new Image();		
		silhouette.src = $('#silhouette').css('background-image').replace(/^url|[\(\)]/g, '');
		// Make sure the image is loaded first otherwise nothing will draw.
		silhouette.onload = function(){
		    photo_context.drawImage(silhouette,0,0);   
		};

		// render video frame on canvas
		photo_context.drawImage($('#tracking-canvas')[0], 0, 0);
						
		// show the canvas		
		$('#photo-canvas').show();
		*/
				
	});
	
	$('#clear').click(function() {
		video.play();
		face_tracking_on = true;			
		$('.poster-title').css('background-color', 'rgba(0,0,0,0.1)');
	});
	
	// init head tracking
	htracker.init(video, trackingCanvas);
	htracker.start();
	
	document.addEventListener('facetrackingEvent', 
	  function (event) {
	    //console.log('x: ' + event.x);
		if(face_tracking_on) {
			$('#silhouette').css('left', (190 - event.x) + 'px');
			$('#video').css('-webkit-mask-position', (event.x - 190) + 'px 0px');
			$('#photo-canvas').css('-webkit-mask-position', (event.x - 190) + 'px 0px');
		}
	  }
	);
		
});
