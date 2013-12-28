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

face_tracking_on = true;

// Put event listeners into place
$(document).ready(function() {
	// Grab elements, create settings, etc.
		var video = document.getElementById("video"),
		videoObj = { "video": true },
		htracker = new headtrackr.Tracker(),
		trackingCanvas = document.getElementById("tracking-canvas"),
		photoCanvas = document.getElementById("photo-canvas"),
		photoContext = photoCanvas.getContext("2d"),
		errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};

	htracker.init(video, trackingCanvas);
	htracker.start();

	/*
	// Put video listeners into place
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
	}*/
		
	document.addEventListener('facetrackingEvent', 
	  function (event) {
	    //console.log('x: ' + event.x);
		if(face_tracking_on) {
			$('#silhouette').css('left', (190 - event.x) + 'px');
			$('#video').css('-webkit-mask-position', (event.x - 190) + 'px 0px');
			$('#tracking-canvas').css('-webkit-mask-position', (event.x - 190) + 'px 0px');
			$('#photo-canvas').css('-webkit-mask-position', (event.x - 190) + 'px 0px');
		}
	  }
	);
			
	// Trigger photo take
	$('#snap').click(function() {
		photoContext.drawImage(video, 0, 0, 640, 480);
		face_tracking_on = false;			
	});
	
	$('#clear').click(function() {
    	photoContext.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
		face_tracking_on = true;			
	});
	
	$('#mask').click(function() {
		$('#video').toggleClass('mask');
		$('#photo-canvas').toggleClass('mask');
		if($('#video').hasClass('mask')) {
			$('#background').css('z-index', '0');
			$('#silhouette').show();
		} else {
			$('#background').css('z-index', '5');
			$('#silhouette').hide();
		}
	});
	
	$('#tracking').click(function() {
		if(face_tracking_on) {
			face_tracking_on = false;			
		} else {
			face_tracking_on = true;
		}
	});
	
});
