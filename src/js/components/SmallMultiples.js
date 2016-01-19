import LineChart from './LineChart';

export default function SmallMultiples(data,options) {

	
	let chart=d3.select(options.container)
			.append("div")
			.attr("class","smallmultiples")
			.selectAll("div.chart")
				.data(data)
				.enter()
				.append("div")
				.attr("class","chart");

	chart.append("h4")
			.text(d => d.title)
	let linecharts=[];
	chart.each(function(d){
		linecharts.push(
			new LineChart(d.data,{
				width:0.25,//1/data.length,
				container:this,
				country:options.country,
				mouseEnterCallback: (country) => {
					linecharts.forEach(l => l.highlightCountry(country))
				}
			})
		);
	})

}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};