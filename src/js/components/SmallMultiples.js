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
			.html(d => {
				return options.indicators[d.title]?options.indicators[d.title].title:d.title;
			})
	chart.append("p")
			.html(d => {
				return options.indicators[d.title]?options.indicators[d.title].subtitle:d.title;
			})
	
	let linecharts=[];
	chart.each(function(d){
		linecharts.push(
			new LineChart(d.data,{
				//width:1/3,//1/data.length,
				container:this,
				country:options.country,
				indicator:options.indicators[d.title],
				highlight_top:true,
				mouseEnterCallback: (country) => {
					linecharts.forEach(l => l.highlightCountry(country))
				},
				mouseLeaveCallback: (country) => {
					linecharts.forEach(l => l.highlightCountry())
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