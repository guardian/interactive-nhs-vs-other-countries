export function appendShadow(item, x, y, col) {
	// compute new text-shadow property

	//console.log("appendShadow",item,x,y,col)

	var textShadow = '';

	if (item.style['textShadow'] !== 'none') {
		//console.log("--->",item.style['textShadow'],item.style)
		textShadow = item.style['textShadow'] + ', ';
	}
	
	textShadow = textShadow + x + 'px ' + y + 'px ' + col;

	// apply new text-shadow property
	//item.css('text-shadow', textShadow);

	//console.log(textShadow)
	item.style['textShadow']=textShadow;

	//return textShadow;
}