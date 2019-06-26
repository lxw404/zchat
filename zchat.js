var uStore = {};
var jn = 0;

function appEl(obj){
    var scr = ($(window).scrollTop() + $(window).height() == $(document).height());
	for (var i=0; i<obj.data.length; i++){
		var c = $('#con');
		var r = document.createElement('div');
		r.className = 'row';
		r.innerHTML = '<div class=\"col\"><div class=\"uname\">' + obj.data[i].dname + ' (' +obj.data[i].uname + ')</div>' + obj.data[i].data + '</div>';
		c.appendChild(r);
	}
	
	$('body').find('script').remove();
	
	if (obj.data.length > 0){
		jn += 1;
        if (scr){
            window.scrollTo(0,document.body.scrollHeight);
        }
	}
}

function onT(){
	var s = document.createElement('script');
	s.src = 'a' + jn.toString(16) + '.js';
	s.id = 'rq_a' + jn.toString(16) + '.js';
	document.body.appendChild(s);
}

var si = setInterval(onT,1000);