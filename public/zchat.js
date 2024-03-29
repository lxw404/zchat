var uStore = {}; // Storage of avatar images
var jn = 0;      // Current request number

// Hyperlink click
function hlc(e){
    e.firstChild.innerHTML = '';
    var r = document.createRange();
    r.selectNode(e);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    // Change tooltip text
    e.firstChild.innerHTML = 'Copied';
}

// Hyperlink hover
function hlm(e){
    e.firstChild.innerHTML = 'Copy to clipboard';
}

// Is an element contained within two index boundaries?
function conT(e, ind, end){
    return ((ind > e.ind) && (end < e.end));
}

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
            // Underline
            i0 = 1;
            i1 = mat[0].length - 1;
        }
        else if (typ == 7){
            // Strikethrough
            i0 = 2;
            i1 = mat[0].length - 2;
        }
        else if (typ == 8){
            // Formatting
            var tmp = mat[0].split(';');
            var t1 = tmp[0].substring(1,tmp[0].length);
            var t2 = tmp[1].substring(0,tmp[1].length-1);
            var t3 = [];
            var t4 = '';
            var t5 = '';
            i0 = t1.search(/\S/);
            if (i0 == -1){
                i0 = 1;
            }
            else {
                i0 = i0 + 1;
            }
            i1 = i0 + t1.trim().length;
            t2 = t2.split(',');
            for (var i=0; i<t2.length; i++){
                t3 = t2[i].split('=');
                t4 = t3[0].trim();
                t5 = t3[t3.length-1].trim();
                if (t4 == t5){
                    t4 = 'color'; // Shortcut
                }
                t4 = t4.toLowerCase();
                xd[t4] = t5;
            }
        }
        else if (typ == 10){
            i0 = 0;
            i1 = mat[0].length;
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
function elP(el, str, scr, dat){
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
    
    // Find underline tokens
    pat = /\_{1}.*?\_{1}/g;
    addT(tok, str, pat, 6);
    
    // Find strikethrough tokens
    pat = /\~{2}[^\s]+\~{2}/g;
    addT(tok, str, pat, 7);
    
    // Find formatting tokens
    pat = /\{[^\{]+\;.*?\}/g;
    addT(tok, str, pat, 8);
    
    // Find links
    pat = /\[([^\[]+)\]\(([^\)]+)\)/g;
    
    // Find http/https
    pat = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    addT(tok, str, pat, 10);
    
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
    var mind = 0;   // Minimum encountered index
    var xind = 0;   // Maximum encountered index
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
        if (mind > xind){
            xind = mind;
        }
    }
    if (xind < str.length){
        tok.push({
            "type": 0,
            "ind": xind,
            "end": str.length-1,
            "data": str.substring(xind, str.length)
        });
    }
    
    // Containment pass
    var cn = -1;
    for (var i=0; i<tok.length; i++){
        cn = tok.findIndex(function(e){ return conT(e, tok[i].ind, tok[i].end) });
        if (cn != -1){
            tok[i]["con"] = cn;
        }
    }
    
    // Loop through all tokens and append them to the element
    for (var i=0; i<tok.length; i++){
        var dd = tok[i].data;
        if (i==0 && dd.substring(0,3) == '/me'){
            // IC Chat
            dd = dat.dname + dd.substring(3,dd.length);
            el.removeChild(el.firstChild);
        }
        if (tok[i].type == 0){
            // Normal text
            el.appendChild(document.createTextNode(dd));
        }
        else if (tok[i].type == 1){
            // Image
            var g = document.createElement('img');
            g.src = tok[i].data;
            if (scr){
                g.addEventListener('load', function(){
                    // Scroll to the bottom
                    window.scrollTo(0,document.body.scrollHeight);
                });
            }
            el.appendChild(g);
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
            if (scr){
                g.addEventListener('loadeddata', function(){
                    // Scroll to the bottom
                    window.scrollTo(0,document.body.scrollHeight);
                });
            }
            el.appendChild(g);
        }
        else if (tok[i].type == 3){
            // Bold
            var g = '';
            if (tok[i].con != undefined){
                g = tok[tok[i].con].e;
                g.className += ' bold';
                if (g.textContent.length > dd.length){
                    g.removeChild(g.firstChild);
                    g.appendChild(document.createTextNode(dd));
                }
            }
            else {
                g = document.createElement('span');
                g.className = 'bold';
                g.appendChild(document.createTextNode(dd));
                el.appendChild(g);
            }
            tok[i]["e"] = g;
        }
        else if (tok[i].type == 4){
            // Italic
            var g = '';
            if (tok[i].con != undefined){
                g = tok[tok[i].con].e;
                g.className += ' it';
                if (g.textContent.length > dd.length){
                    g.removeChild(g.firstChild);
                    g.appendChild(document.createTextNode(dd));
                }
            }
            else {
                g = document.createElement('span');
                g.className = 'it';
                g.appendChild(document.createTextNode(dd));
                el.appendChild(g);
            }
            tok[i]["e"] = g;
        }
        else if (tok[i].type == 5){
            // Bold + Italic
            var g = '';
            if (tok[i].con != undefined){
                g = tok[tok[i].con].e;
                g.className += ' bold it';
                if (g.textContent.length > dd.length){
                    g.removeChild(g.firstChild);
                    g.appendChild(document.createTextNode(dd));
                }
            }
            else {
                g = document.createElement('span');
                g.className = 'bold it';
                g.appendChild(document.createTextNode(dd));
                el.appendChild(g);
            }
            tok[i]["e"] = g;
        }
        else if (tok[i].type == 6){
            // Underline
            var g = '';
            if (tok[i].con != undefined){
                g = tok[tok[i].con].e;
                g.className += ' udl';
                if (g.textContent.length > dd.length){
                    g.removeChild(g.firstChild);
                    g.appendChild(document.createTextNode(dd));
                }
            }
            else {
                g = document.createElement('span');
                g.className = 'udl';
                g.appendChild(document.createTextNode(dd));
                el.appendChild(g);
            }
            tok[i]["e"] = g;
        }
        else if (tok[i].type == 7){
            // Strikethrough
            var g = '';
            if (tok[i].con != undefined){
                g = tok[tok[i].con].e;
                g.className += ' stk';
                if (g.textContent.length > dd.length){
                    g.removeChild(g.firstChild);
                    g.appendChild(document.createTextNode(dd));
                }
            }
            else {
                g = document.createElement('span');
                g.className = 'stk';
                g.appendChild(document.createTextNode(dd));
                el.appendChild(g);
            }
            tok[i]["e"] = g;
        }
        else if (tok[i].type == 8){
            // Formatting
            var c = tok[i].con;
            var g = '';
            if (c != undefined){
                g = tok[c].e;
            }
            else {
                g = document.createElement('span');
            }
            var ks = Object.keys(tok[i].xd);
            var vv = '';
            for (var k of ks){
                vv = document.createElement('div');
                vv.appendChild(document.createTextNode(tok[i].xd[k]));
                vv = vv.innerHTML;
                if (k == 'color'){
                    if (vv == 'rainbow'){
                        g.className += ' rainbow';
                    }
                    else if (vv == 'blink'){
                        g.className += ' blink_red';
                    }
                    else {
                        // Set specific color
                        g.style.color = vv;
                    }
                }
            }
            if (c == undefined){
                g.appendChild(document.createTextNode(dd));
                el.appendChild(g);
            }
            else if (g.textContent.length > dd.length){
                g.removeChild(g.firstChild);
                g.appendChild(document.createTextNode(dd));
            }
            tok[i]["e"] = g;
        }
        else if (tok[i].type == 9){
            // Quoted
            
        }
        else if (tok[i].type == 10){
            // Hyperlinks
            var tt = document.createElement('div');
            tt.innerHTML = 'Copy to clipboard';
            tt.className = 'ttip';
            g = document.createElement('span');
            g.setAttribute('onclick', 'hlc(this);');
            g.setAttribute('onmouseout', 'hlm(this);');
            g.className = 'hyl';
            g.appendChild(tt);
            g.appendChild(document.createTextNode(dd));
            el.appendChild(g);
        }
    }
    
    return el;
}

// Execute JSONP embedded function on avatar image return
function avEl(obj){
    if ((obj.data != '') && (uStore[obj.id] != '_')){
        // Add the image to the stylesheet
        uStore[obj.id] = '_';  // Mark complete
        styl = ' .g_' + obj.id + ' { background-image: url(' + obj.data + ') !important; } ';
        $('#sty').append(document.createTextNode(styl));
    }
    
    // Remove av script requests
    $('#req').find('script').remove();
}

// Execute JSONP embedded function on returned data
function appEl(obj){
    var chk = obj.id.replace(/\//g,'');
    if (chk == ('a' + jn.toString(16) + '.js')){
        // Get container
        var c = document.getElementById('con');
        
        // Check if scroll is at bottom
        var scr = (($(window).scrollTop() + window.innerHeight) == $(document).height());
        
        // Create mutation observer
        if (scr){
            var obs = new MutationObserver(function(mutList){
                // Scroll to the bottom
                window.scrollTo(0,document.body.scrollHeight);
                obs.disconnect();  // Remove observer
            });
            obs.observe(c, {childList: true});
        }
        
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
                    // Fetch image
                    var s = document.createElement('script');
                    s.src = obj.data[i].id + '.rq'; // Request extension
                    s.id = 'g_' + obj.data[i] + '_';
                    $('#req').append(s);
                }
                
                // Complete image/row creation
                g.className += ' g_' + obj.data[i].id;
                g.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Webkit fix
                g.alt = '';
                r.appendChild(g);
                u.appendChild(document.createTextNode(obj.data[i].dname + ' (' +obj.data[i].uname + ')'));
                cc.appendChild(u);
                cc = elP(cc, obj.data[i].data, scr, obj.data[i]);  // Parse for syntax
                r.appendChild(cc);
                c.appendChild(r);
            }
            else{
                // Change base URI
                $('head base').attr('href', obj.data[i].uri);
            }
        }
        
        // Remove all script requests
        $('#scr').find('script').remove();
        
        // If elements were added, increment the request number
        if (obj.data.length > 0){
            jn += 1;
        }
    }
}

// Handle creating a script request
function onT(){
	var s = document.createElement('script');
	s.src = 'a' + jn.toString(16) + '.js';
	s.id = 'rq_a' + jn.toString(16) + '.js';
	$('#scr').append(s);
}

// Repeatedly poll the server
var si = setInterval(onT,1000);