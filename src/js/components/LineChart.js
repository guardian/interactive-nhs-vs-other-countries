export default function LineChart(data,options) {

	console.log(data,options)

	let container=d3.select(options.container)
						.style("width",options.width*100+"%")
	let linechart=container.append("div")
					.attr("class","linechart");

	let svg=linechart.append("svg");

	let box=svg.node().getBoundingClientRect();
	let WIDTH = box.width,
		HEIGHT= box.height;
	
	let margins=options.margins || {
		top:10,
		bottom:30,
		left:55,
		right:55
	};

	let extents={};
	updateExtents();
	console.log(extents)

	let xscale,yscale,country;

	buildVisual();

	let samples=[],
			voronoi,
			cell,
			voronoi_centers;

	buildVoronoi();

	function buildVisual() {

		xscale=d3.scale.linear().domain(extents.years).range([0,WIDTH-(margins.left+margins.right)]);
		yscale=d3.scale.linear().domain([(extents.values[0]<0?extents.values[0]:0),extents.values[1]]).range([HEIGHT-(margins.top+margins.bottom),0]).nice();

		let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })
				    .interpolate("cardinal")
		let area = d3.svg.area()
				    .x(function(d) { return xscale(d.x); })
				    .y0(yscale.range()[0])
				    .y1(function(d) { return yscale(d.y); })
				    .interpolate("cardinal")
				    //.defined(function(d) { return d.y; })
		
		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+margins.left+","+margins.top+")")

		let countries=svg.append("g")
						.attr("class","countries")
						.attr("transform","translate("+margins.left+","+margins.top+")")
		
		let selected_country=countries.selectAll("g.selected-country")
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
					})

		country=countries
						.selectAll("g.country")
						.data(data.filter(d => d.data).map(d => {
							d.max_year=d3.max(d.data.filter(v=>v.value),v=>v.year);
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
							.on("mouseenter",function(d){
								
								country.filter(c=>(c.country===options.country)).moveToFront();
								d3.select(this).moveToFront();

							})


		country
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
				//console.log("----->",d)
				return d.data.filter(v=>v.year===d.max_year)
			})
			.enter()
			.append("circle")
					.attr("class","last")
					.attr("rel",d => d.year+":"+d.value)
					.attr("cx",d => xscale(d.year))
					.attr("cy",d => yscale(d.value))
					.attr("r",3);

		country.append("text")
					.attr("x",xscale.range()[1])
					.attr("dx",5)
					.attr("dy","0.25em")
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
				    	return d3.format("0d")(d)
				    	//return !(d%60)?d/60:self.extents.minute.minute
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate("+0+"," + (yscale.range()[0]) + ")")
			      .call(xAxis);

		xaxis.append("line")
				.attr("class","zero")
				.attr("x1",0)
				.attr("y1",-yscale.range()[0]+yscale(0))
				.attr("x2",xscale.range()[1])
				.attr("y2",-yscale.range()[0]+yscale(0))

		xaxis.selectAll(".tick")
				.classed("last-tick",(d)=>(d===xscale.domain()[1]))

		let yAxis = d3.svg.axis()
				    .scale(yscale)
				    .orient("left")
				    .ticks(5)
					/*.tickValues(d => {
						return xscale.ticks().filter(y => {
							return y%10===0
						}).concat([xscale.domain()[1]])
					})
				    .tickFormat((d)=>{
				    	return d3.format("0d")(d)
				    	//return !(d%60)?d/60:self.extents.minute.minute
				    })*/
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate("+0+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				.filter(d => d!==0)
				.select("line")
					.attr("x2",d => xscale.range()[1])

		
	}
	let highlightCountry = this.highlightCountry = (c) => {
		//console.log(c)
		country
			.classed("highlight",false)
			.filter(d => d.country === c)
			.classed("highlight",true)
			.moveToFront();

	}

	function buildVoronoi() {
		

		console.log("DATA",data)
		data.forEach(d => {
			d.data.forEach(v => {
				//console.log(v,d.country)
				v.country=d.country;
				samples.push(v);//push([xscale(v.year),yscale(v.value)])
			})
		})
		console.log(samples)

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
		
			
		
		//cellEnter.append("circle").attr("r", 1);
		cellEnter.append("path");
		
		//cell.select("circle").attr("transform", function(d) { return "translate(" + d.point + ")"; });
		cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
	function updateExtents() {	
		let years=data.map(d => d3.extent(d.data.filter(v=>v.year>0),v=>v.year)),
			values=data.map(d => d3.extent(d.data.filter(v=>(typeof v.value === 'number')),v=>v.value));
		console.log("YEARS",years,values)
		extents={
			years:[d3.min(years,v=>v[0]),d3.max(years,v=>v[1])],
			values:[d3.min(values,v=>v[0]),d3.max(values,v=>v[1])]
		}

		//console.log("EXTENTS",this.extents)
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