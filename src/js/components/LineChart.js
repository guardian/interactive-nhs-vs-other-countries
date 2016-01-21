import { appendShadow } from '../lib/CSSUtils';

export default function LineChart(data,options) {

	//console.log(data,options)

	let container=d3.select(options.container)
						//.style("width",options.width*100+"%")
	let linechart=container.append("div")
					.attr("class","linechart");

	let svg=linechart.append("svg");

	let box=svg.node().getBoundingClientRect();
	let WIDTH = box.width,
		HEIGHT= box.height;
	
	let margins=options.margins || {
		top:14,
		bottom:30,
		left:5,
		right:15
	};
	let padding=options.padding || {
		top:0,
		bottom:0,
		left:20,
		right:0
	};

	let extents={};
	updateExtents();
	//console.log(extents)

	let xscale,yscale,country;

	buildVisual();

	let samples=[],
			voronoi,
			cell,
			voronoi_centers;

	buildVoronoi();

	function buildVisual() {

		svg.on("mouseleave",d=>{
			if(options.mouseLeaveCallback) {
				options.mouseLeaveCallback();
			}
		})

		xscale=d3.scale.linear().domain(extents.years).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);
		yscale=d3.scale.linear().domain([(extents.values[0]<0?extents.values[0]:0),extents.values[1]]).range([HEIGHT-(margins.top+margins.bottom),0]).nice();

		//alert(xscale.range()[1])

		let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })

				    //.interpolate("cardinal")
		
		let area = d3.svg.area()
				    .x(function(d) { return xscale(d.x); })
				    .y0(yscale.range()[0])
				    .y1(function(d) { return yscale(d.y); })
				    //.interpolate("cardinal")
				    //.defined(function(d) { return d.y; })
		if(!options.indicator.interpolate || options.indicator.interpolate!=="none") {
			line.interpolate("cardinal");
			area.interpolate("cardinal");
		}
		
		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		let countries=svg.append("g")
						.attr("class","countries")
						.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
		
		/*let selected_country=countries.selectAll("g.selected-country")
						.data(data.filter(d => (d.data && (d.country === options.country))).map(d => {
							
							d.paths=dataToMultiplePaths(d.data);	
							console.log(d.country,d.paths)
							
							return d;
						}))
						.enter()
						.append("g")
							.attr("class",function(d){
								return "country selected-country"
							})
							.attr("rel",function(d){
								return d.country;
							})
		selected_country
			.selectAll("path")
			.data(d => d.paths.filter(p => p.length>1))
			.enter()
			.append("path")
					.attr("class","area")
					.attr("d",d => {
						//console.log(d)
						return area(d.map(v => {
							return {
								x:v.year,
								y:v.value
							}
						}))
					})*/

		country=countries
						.selectAll("g.country")
						.data(data.filter(d => d.data && (d.data.filter(v=>v.value!==null).length>0)).map(d => {
							d.max_year=d3.max(d.data.filter(v=>v.value),v=>v.year);
							//console.log("!",d.max_year,d.country,d.data)
							d.last_value=d.data.filter(v=>(v.year===d.max_year))[0].value;
							d.paths=dataToMultiplePaths(d.data);	
							//console.log(d.country,d.paths)
							
							return d;
						}))
						.enter()
						.append("g")
							.attr("class","country")
							.classed("selected",(d) => { return d.country === options.country})
							.classed("lighter",d => (typeof options.country !== 'undefined' && d.country !== options.country))
							.attr("rel",(d) => d.country)

		country.filter((d) => { return d.country === options.country}).moveToFront();
		
		let top_country=getTopCountry();

		country
			.classed("top",d => (d.country === top_country && options.highlight_top))
			.selectAll("path.fg")
			.data(d => d.paths.filter(p => p.length>1))
			.enter()
			.append("path")
					.attr("class","fg")
					.attr("d",d => {
						//console.log(d)
						return line(d.map(v => {
							return {
								x:v.year,
								y:v.value
							}
						}))
					})

		country
			.selectAll("circle.fg")
			.data(d => d.paths.filter(p => p.length===1))
			.enter()
			.append("circle")
					.attr("class","fg")
					.attr("cx",d => xscale(d[0].year))
					.attr("cy",d => yscale(d[0].value))
					.attr("r",1);

		country
			.selectAll("circle.last")
			.data(d => {
				return d.data.filter(v=>v.year===d.max_year)
			})
			.enter()
			.append("circle")
					.attr("class","last")
					.attr("rel",d => d.year+":"+d.value)
					.attr("cx",d => xscale(d.year))
					.attr("cy",d => yscale(d.value))
					.attr("r",3);

		let text=country.append("text")
					.attr("x",d => {
						let values=d.data.filter(v => (typeof v.value ==='number')),
							last=values[values.length-1];
						if(!last) {
							return "";
						}
						return xscale(last.year)
					})
					//.attr("dx",5)
					.attr("dy",-6)
					.style("text-shadow","none")
					.attr("y",d => {
						let values=d.data.filter(v => (typeof v.value ==='number')),
							last=values[values.length-1];

						//console.log(d.country)

						if(!last) {
							return "";
						}

						//console.log(last,typeof last.value, values)
						//console.log(d,d.country,last.year,last.value)
						return yscale(last.value)
					})
					.text(d => d.country)

		text.each(function(d){
						let strokeSize=2,
							strokeColor="#ffffff";
						for (var angle=0; angle<2*Math.PI; angle+=1/strokeSize) {
						    appendShadow(this, Math.cos(angle) * strokeSize, Math.sin(angle) * strokeSize, strokeColor);
						}
					})
		

		let xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
				    //.ticks(4)
					.tickValues(d => {
						/*return xscale.ticks().filter(y => {
							return y%10===0
						})*/
						return xscale.ticks(3).concat([xscale.domain()[1]])
					})
				    .tickFormat((d)=>{
				    	let year=d3.format("0d")(d);
				    	if(year%1000===0) {
				    		return year;
				    	}
				    	return "'"+year.substr(2)
				    	//return !(d%60)?d/60:self.extents.minute.minute
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate("+0+"," + (yscale.range()[0]) + ")")
			      .call(xAxis);

		xaxis.append("line")
				.attr("class","zero")
				.attr("x1",-padding.left)
				.attr("y1",-yscale.range()[0]+yscale(0))
				.attr("x2",xscale.range()[1])
				.attr("y2",-yscale.range()[0]+yscale(0))

		//xaxis.selectAll(".tick")
				//.classed("last-tick",(d)=>(d===xscale.domain()[1]))

		let yAxis = d3.svg.axis()
				    .scale(yscale)
				    .orient("left")
				    .ticks(3)				    
					/*.tickValues(d => {
						return xscale.ticks().filter(y => {
							return y%10===0
						}).concat([xscale.domain()[1]])
					})*/
				    .tickFormat((d)=>{
				    	return d3.format(",.0d")(d) + (options.indicator.unit||"");
				    	//return d3.format("0d")(d)
				    	//return !(d%60)?d/60:self.extents.minute.minute
				    })
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate("+(-padding.left)+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				.filter((d,i) => d!==0)
				.select("line")
					.classed("visible",true)
					.attr("x2",(d,i) => {
						//console.log(i,d)
						return xscale.range()[1]+padding.left
					})

		yaxis.selectAll(".tick")
				.select("text")
					.attr("x",0)
					.attr("y","-7")
		
	}
	let highlightCountry = this.highlightCountry = (c) => {
		//console.log(c)
		
		if(!c) {
			country
				.classed("highlight",false)			
			return;
		}	

		country
			.filter(d => d.country === options.country)
			.moveToFront();		

		country
			.classed("highlight",false)
			.filter(d => d.country === c)
			.classed("highlight",true)
			.moveToFront();
	}

	function buildVoronoi() {
		

		//console.log("DATA",data)
		data.forEach(d => {
			d.data.forEach(v => {
				//console.log(v,d.country)
				v.country=d.country;
				samples.push(v);//push([xscale(v.year),yscale(v.value)])
			})
		})
		//console.log(samples)

		voronoi = d3.geom.voronoi()
					.x(function(d) { return xscale(d.year); })
					.y(function(d) { return yscale(d.value); })
    				.clipExtent([[-2, -2], [WIDTH + 2, HEIGHT + 2]]);

    	cell = svg.append("g")
					    .attr("class", "voronoi")
					    .attr("transform","translate("+margins.left+","+margins.top+")")
					  	.selectAll("g");

		resample(10);
	}
	function resample(samplesPerSegment) {
		let self=this;
		//console.log("samples",samples)
		let voronoi_data=voronoi(samples);//voronoi(samples.filter(function(d){return typeof d !== 'undefined'}));
		voronoi_centers=voronoi_data.map(function(d){return d.point});

		//console.log("voronoi_data",voronoi_data)

		cell = cell.data(voronoi_data.filter(function(d){return typeof d !== 'undefined'}));
		cell.exit().remove();
		
		var cellEnter = cell.enter().append("g").datum(d => {return d;});

		
		cellEnter
			.on("mouseenter",(d) => {
				//console.log(d.point.country)
				
				//highlightCountry(d.point.country)
				options.mouseEnterCallback(d.point.country);
			})
			.on("touchstart",(d) => {
				options.mouseEnterCallback(d.point.country);	
			})
		
			
		
		//cellEnter.append("circle").attr("r", 1);
		cellEnter.append("path");
		
		//cell.select("circle").attr("transform", function(d) { return "translate(" + d.point + ")"; });
		cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
	function updateExtents() {	
		let years=data.map(d => d3.extent(d.data.filter(v=>v.year>0),v=>v.year)),
			values=data.map(d => d3.extent(d.data.filter(v=>(typeof v.value === 'number')),v=>v.value));
		//console.log("YEARS",years,values)
		extents={
			years:[d3.min(years,v=>v[0]),d3.max(years,v=>v[1])],
			values:[d3.min(values,v=>v[0]),d3.max(values,v=>v[1])]
		}

		//console.log("EXTENTS",this.extents)
	}
	function getTopCountry() {
		//console.log("--------",d3.max(data,c => c.last_value),data)
		return data.filter(d => d.last_value === d3.max(data,c => c.last_value))[0].country
	}
	function dataToMultiplePaths(values) {
		let paths=[
			[]
		];

		values.forEach(d => {
			if(!d.value) {
				paths.push([]);
			}
			if(d.value) {
				paths[paths.length-1].push(d);	
			}
		})

		//console.log(paths)
		return paths.filter(d => (d.length>0))
		

	}
}