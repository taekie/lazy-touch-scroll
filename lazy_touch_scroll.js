/*

Lazy Touch Scroll on touch screen.
original UI design by taekie (taekie@twitter.com) 

*/


var scroll_ratio = 4;
var track_border = 40;

// big screen needs fast scroll.
if (navigator.userAgent.match("iPad")) {
	scroll_ratio = 6;
}

/* ============================== TOUCH TRACKING ============================== */

var screen_h;
var zoom_ratio = 1;
var clicked;
var last_cx, last_cy, touch_cx, touch_cy;
var lastyoffset;

function add_scroll_touchevent(obj) {

	//only works on iOS
	if (!navigator.userAgent.match(/iPhone|iPod|iPad/)) return;

	obj.addEventListener('touchstart', scroll_touch_started, false);
	obj.addEventListener('touchmove', scroll_touch_moved, false);
	obj.addEventListener('touchend', scroll_touch_ended, false);

	screen_h = window.innerHeight;

}


var target_obj;

function scroll_touch_started(event) {
	zoom_ratio = document.documentElement.clientWidth / window.innerWidth;

	moved_after_touch = false;
	clicked = false;

	var touch = event.touches[0];
	lastx = touchx = touch.screenX;
	lasty = touchy = touch.screenY;

	last_cx = touch_cx = touch.clientX;
	last_cy = touch_cy = touch.clientY;

	target_obj = event.touches[0].target;
	lastyoffset = window.pageYOffset;

	//for exceptional button
	if (target_obj.className.match("closebutton")) return;

// touch scroll area is both side of window. [track_border]
// but the top and bottom area is exceptional. there could be some buttons.
	if (touch.screenY > 50 && touch.screenY < document.body.scrollHeight - 50 && (touch.clientX < track_border * zoom_ratio || touch.clientX > window.innerWidth - track_border * zoom_ratio)) {
		clicked = true;
		event.preventDefault();
	}
};


var bottom_offset = 0;

function scroll_touch_moved(event) {
	zoom_ratio = document.documentElement.clientWidth / window.innerWidth;

	if (!clicked) return;
	event.preventDefault();
	var touch = event.touches[0];

	y = window.pageYOffset + (touch.clientY - last_cy) * scroll_ratio * zoom_ratio;

//scrollbar mode. touch scroll area(both sides) and slide away and scroll up or down keeping your finger on screen.
	dx = Math.abs(touch.clientX - touch_cx);
	if (dx > 100) {
		y = (touch.clientY - 50) / (window.innerHeight - 50) * document.body.scrollHeight;
	}

	if (y < 0) y = 0;
	if (y > document.body.scrollHeight - bottom_offset) y = document.body.scrollHeight - bottom_offset;

	window.scrollTo(window.pageXOffset, y);

	lastx = touch.screenX;
	lasty = touch.screenY;

	last_cx = touch.clientX;
	last_cy = touch.clientY;
}


function scroll_touch_ended(event) {
	zoom_ratio = document.documentElement.clientWidth / window.innerWidth;

	if (!clicked) return;

	var touch = event.touches[0];

	if (Math.abs(last_cy - touch_cy) < 1) {
		lasty = lasty - window.pageYOffset;

// page up/down area is 30/70. because page down is more often action.
		if (last_cy < window.innerHeight * 0.3) pgup();
		else if (last_cy < window.innerHeight - 40) pgdn();
		else pgend();
	}

	clicked = false;
}


/* ============================== PAGING FUNCTIONS ============================== */


function pgup() {
	var y = window.pageYOffset - window.innerHeight + 20;
	window.scrollTo(window.pageXOffset, y);
}

var last_big_image = 0;

function pgdn() {
	var last_y = window.pageYOffset;
	var y = window.pageYOffset + window.innerHeight - 20;

	//when paging down, show me the whole image not cutting in the middle of it
	var big_images=document.getElementsByTagName('img');
	for(var i=0;i<big_images.length;i++){
		var img_posy=findPosY(big_images[i]);
		if(img_posy<y && img_posy+parseInt(big_images[i].height)-20>y) {
			var img_posx=findPosX(big_images[i]);
			//when the page is zoomed ignore the images outside of the view.
			if(img_posx>=window.pageXOffset && img_posx+big_images[i].width<=window.pageXOffset+document.documentElement.clientWidth){
				y=img_posy-10;
				//when the image is big, scroll to the bottom of it.
				if(y<=last_y+10) {
					y=window.pageYOffset+window.innerHeight -20;
					y2=img_posy+big_images[i].height-window.innerHeight;
					//but when the image is too big, just page down.
					if(y2-last_y<window.innerHeight && y2>last_y+10) y=y2; 
				}
				
				break;
			}
		}
	}


	window.scrollTo(window.pageXOffset, y);

}

function pgend() {
	var y = document.body.scrollHeight;

	if (y <= window.pageYOffset) pgdn();
	else window.scrollTo(window.pageXOffset, y);
}




// find absolute position of DOM element
// by Peter-Paul Koch & Alex Tingle.
// http://blog.firetree.net/2005/07/04/javascript-find-position/

function findPosY(obj) {
	var curtop = 0;
	if (obj.offsetParent) while (1) {
		curtop += obj.offsetTop;
		if (!obj.offsetParent) break;
		obj = obj.offsetParent;
	} else if (obj.y) curtop += obj.y;
	return curtop;
}

function findPosX(obj) {
	var curleft = 0;
	if (obj.offsetParent) while (1) {
		curleft += obj.offsetLeft;
		if (!obj.offsetParent) break;
		obj = obj.offsetParent;
	} else if (obj.x) curleft += obj.x;
	return curleft;
}



add_scroll_touchevent(document.body)