var uStore = {}; // Storage of avatar images
var jn = 0;      // Current request number

// Parse a string and add to a given element
function elP(el, str){
    var tok = [];
    
    // Tokenize string
    
    
    // Loop through all tokens and append them to the element
    for (var i=0; i<tok.length; i++){
        if (tok[i].type == 0){
            // Normal text
            el.appendChild(document.createTextNode(tok[i].data));
        }
        else if (tok[i].type == 1){
            // Image
            var g = document.createElement('img');
            g.src = tok[i].data;
            el.appendChild(g);
        }
        else if (tok[i].type == 2){
            // webm video
            var g = document.createElement('video');
            g.autoplay = true;
            g.controls = true;
            g.name = 'media';
            g.loop = true;
            var s = document.createElement('source');
            s.type = 'video/webm';
            g.appendChild(s);
            el.appendChild(g);
        }
        else if (tok[i].type == 3){
            // Bold
            var g = document.createElement('span');
            g.className = 'bold';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
        }
        else if (tok[i].type == 4){
            // Italic
            var g = document.createElement('span');
            g.className = 'it';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
        }
        else if (tok[i].type == 5){
            // Bold + Italic
            var g = document.createElement('span');
            g.className = 'bold it';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
        }
        else if (tok[i].type == 6){
            // Rainbow
            var g = document.createElement('span');
            g.className = 'rainbow';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
        }
        else if (tok[i].type == 7){
            // Blinking red
            var g = document.createElement('span');
            g.className = 'blink_red';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
        }
        else if (tok[i].type == 8){
            // Specific color
            var g = document.createElement('span');
            g.style.color = tok[i].color;
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
        }
        else if (tok[i].type == 9){
            // Quoted
            
        }
    }
    
    return el;
}

function appEl(obj){
    var scr = ($(window).scrollTop() + $(window).height() == $(document).height()); // Check if scroll is at bottom
    
    // Loop through all messages
	for (var i=0; i<obj.data.length; i++){
        if (!obj.data[i].uri){
            // Create message content
            var c = $('#con');
            var r = document.createElement('div');
            var g = document.createElement('img');
            var cc = document.createElement('div');
            var u = document.createElement('div');
            var s = document.createElement('span');
            r.className = 'row';
            g.className = 'uimg';
            cc.className = 'col';
            u.className = 'uname';
            
            // Check if style for avatar image should be fetched
            if (uStore[obj.data[i].id] != '_'){
                $.ajax({
                    url: 'http://world.secondlife.com/resident/' + obj.data[i].id,
                    type: 'GET',
                    success: function(res) {
                        var m = $(res).find('.parcelimg');
                        $('#sty').innerHTML += '.g_' + obj.data[i].id + '{content: url(' + m[0].src + ') !important};';
                        uStore[obj.data[i].id] = '_';
                    }
                });
            }
            
            // Complete image/row creation
            g.className += ' g_' + obj.data[i].id;
            r.appendChild(g);
            u.appendChild(document.createTextNode(obj.data[i].dname + ' (' +obj.data[i].uname + ')'));
            cc.appendChild(u);
            cc = elP(cc, obj.data[i].data);  // Parse for syntax
            r.appendChild(cc);
            c.append(r);
        }
        else{
            // Change base URI
            $('head base').attr('href', obj.data[i].uri);
        }
	}
	
    // Remove all script requests
	$('body').find('script').remove();
	
    // If elements were added, increment the request number
	if (obj.data.length > 0){
		jn += 1;
        if (scr){
            // Scroll to the bottom
            window.scrollTo(0,document.body.scrollHeight);
        }
	}
}

// Handle creating a script request
function onT(){
	var s = document.createElement('script');
	s.src = 'a' + jn.toString(16) + '.js';
	s.id = 'rq_a' + jn.toString(16) + '.js';
	document.body.appendChild(s);
}

// Repeatedly poll the server
var si = setInterval(onT,1000);