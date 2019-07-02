var uStore = {}; // Storage of avatar images
var jn = 0;      // Current request number

// Append tokens to a list given a regular expression and a type
function addT(t, str, reg, typ){
    var mat = '';
    var i0 = 0;
    var i1 = 1;
    var ind = 0;
    var end = 0;
    var ta = typ;
    var xd = {};
    var d = '';
    while(mat = reg.exec(str)){
        xd = {};
        ind = mat.index;
        end = (ind + mat[0].length - 1);
        if (typ == 1 || typ == 2){
            // Image/Video
            i0 = 2;
            i1 = mat[0].length - 1;
            var tmp = mat[0].split('.');
            tmp = tmp[tmp.length-1].toLowerCase();
            if (tmp == 'webm]'){
                ta = 2;
                xd["vtyp"] = 'video/webm';
            }
            else if (tmp == 'ogg]'){
                ta = 2;
                xd["vtyp"] = 'video/ogg';
            }
            else if (tmp == 'mp4]'){
                ta = 2;
                xd["vtyp"] = 'video/mp4';
            }
            else {
                ta = 1;
            }
        }
        else if (typ == 3){
            // Bold
            i0 = 2;
            i1 = mat[0].length - 2;
            if (t.find(function(e){
                return ((ind >= e.ind) && (end <= e.end));
            })){
                continue;
            }
        }
        else if (typ == 4){
            // Italic
            i0 = 1;
            i1 = mat[0].length - 1;
            if (t.find(function(e){
                return ((ind >= e.ind) && (end <= e.end));
            })){
                continue;
            }
            if (ind == (end-1)){
                continue;
            }
        }
        else if (typ == 5){
            // Bold + Italic
            i0 = 3;
            i1 = mat[0].length - 3;
        }
        else if (typ == 6){
            // Formatting
            var tmp = mat[0].split(';');
            var t1 = tmp[0].substring(1,tmp[0].length);
            var t2 = tmp[1].substring(0,tmp[1].length-1);
            i0 = t1.search(/\S/);
            if (i0 == -1){
                i0 = 1;
            }
            else {
                i0 = i0 + 1;
            }
            i1 = i0 + t1.trim().length;
            console.log(i0 + ' -> ' + i1);
            t2 = t2.split(',');
            console.log(t2);
        }
        d = mat[0].substring(i0, i1);
        t.push({
            "type": ta,
            "ind": ind,
            "end": end,
            "data": d,
            "xd": xd
        });
    }
    return t;
}

// Parse a string and add to a given element
function elP(el, str){
    var tok = [];  // Sorted tokens
    var lel = {};  // Last element for nested tokens
    
    // Find image/video tokens
    var pat = /\!\[.*?\]/g;
    addT(tok, str, pat, 1);
    
    // Find bold+italic tokens
    pat = /\*{3}[^*]+\*{3}/g;
    addT(tok, str, pat, 5);
    
    // Find bold tokens
    pat = /\*{2}[^*]+\*{2}/g;
    addT(tok, str, pat, 3);
    
    // Find italic tokens
    pat = /\*{1}.*?\*{1}/g;
    addT(tok, str, pat, 4);
    
    // Find formatting tokens
    pat = /\{[^\{]+\;.*?\}/g;
    addT(tok, str, pat, 6);
    
    // Find links
    pat = /\[([^\[]+)\]\(([^\)]+)\)/g;
    
    
    // Sort tokens
    tok.sort(function(a,b){
        if (a.ind > b.ind){
            return 1;
        }
        else if (a.ind < b.ind){
            return -1;
        }
        else {
            return 0;
        }
    });
    
    // Insert normal text tokens
    var mind = 0;
    var tmp = 0;
    var ind = 0;
    for (var i=0; i<tok.length; i++){
        ind = tok[i].ind;
        tmp = tok[i].end + 1;
        if (ind > mind){
            tok.splice(i, 0, {
                "type": 0,
                "ind": mind,
                "end": ind-1,
                "data": str.substring(mind, ind)
            });
            i++;
        }
        mind = tmp;
    }
    if (mind < str.length){
        tok.push({
            "type": 0,
            "ind": mind,
            "end": str.length-1,
            "data": str.substring(mind, str.length)
        });
    }
    
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
            lel = g;
        }
        else if (tok[i].type == 2){
            // Video
            var g = document.createElement('video');
            g.autoplay = true;
            g.controls = true;
            g.name = 'media';
            g.loop = true;
            var s = document.createElement('source');
            s.type = tok[i].xd['vtyp'];
            s.src = tok[i].data;
            g.appendChild(s);
            el.appendChild(g);
            lel = g;
        }
        else if (tok[i].type == 3){
            // Bold
            var g = document.createElement('span');
            g.className = 'bold';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
            lel = g;
        }
        else if (tok[i].type == 4){
            // Italic
            var g = document.createElement('span');
            g.className = 'it';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
            lel = g;
        }
        else if (tok[i].type == 5){
            // Bold + Italic
            var g = document.createElement('span');
            g.className = 'bold it';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
            lel = g;
        }
        else if (tok[i].type == 6){
            // Formatting
            var g = document.createElement('span');
            g.className = 'rainbow';
            g.appendChild(document.createTextNode(tok[i].data));
            el.appendChild(g);
            lel = g;
        }
        else if (tok[i].type == 7){
            // Quoted
            
        }
    }
    
    return el;
}

// Execute JSONP embedded function on returned data
function appEl(obj){
    // Get container
    //var c = $('#con');
    var c = document.getElementById('con');
    
    // Check if scroll is at bottom
    //var scr = (($(window).scrollTop() + $(window).height()) == $(document).height());
    //console.log(scr + ' ' + $(window).scrollTop() + ', ' + $(window).height() + ', ' + $(document).height());
    var scr = (($(window).scrollTop() + window.innerHeight) == $(document).height());
    console.log(scr + ' ' + $(window).scrollTop() + ', ' + window.innerHeight + ', ' + $(document).height());
    
    // Create mutation observer
    var obs = new MutationObserver(function(mutList){
        if (obj.data.length > 0 && scr){
            // Scroll to the bottom
            window.scrollTo(0,document.body.scrollHeight);
        }
        obs.disconnect();
    });
    obs.observe(c, {childList: true});
    
    
    // Loop through all messages
	for (var i=0; i<obj.data.length; i++){
        if (!obj.data[i].uri){
            // Create message content
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
                /*$.ajax({
                    url: 'http://world.secondlife.com/resident/' + obj.data[i].id,
                    type: 'GET',
                    success: function(res) {
                        var m = $(res).find('.parcelimg');
                        $('#sty').innerHTML += '.g_' + obj.data[i].id + '{content: url(' + m[0].src + ') !important};';
                        uStore[obj.data[i].id] = '_';
                    }
                });*/
            }
            
            // Complete image/row creation
            g.className += ' g_' + obj.data[i].id;
            r.appendChild(g);
            u.appendChild(document.createTextNode(obj.data[i].dname + ' (' +obj.data[i].uname + ')'));
            cc.appendChild(u);
            cc = elP(cc, obj.data[i].data);  // Parse for syntax
            r.appendChild(cc);
            //c.append(r);
            c.appendChild(r);
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
        /*console.log(scr);
        if (scr){
            // Scroll to the bottom
            window.scrollTo(0,document.body.scrollHeight);
        }*/
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