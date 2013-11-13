var m = [30, 10, 10, 10],
    w = 800 - m[1] - m[3],
    h = 500 - m[0] - m[2];

var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg;


//@ smin = valor minimo da escala da coluna
//@ smax = valor maximo da escala da coluna
//OBS. para nao processar a coluna especificada colocar o caractere '#' no inicio do nome do campo
function executa(data_file, smin,smax){
	d3.csv(data_file, function(data) {

	  // Extract the list of dimensions and create a scale for each.
	  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {

	    //"name" refere-se a primeira linha apenas para verificar se a primeira linha ja foi lida
	    return d[0] != "#" && (y[d] = d3.scale.linear()
		.domain([smin,smax])
		.range([h, 0]));
	  }));
	
	d3.select("#info2").select("svg").remove();
	svg = d3.select("#info2");
	svg = d3.select("#info2").append("svg")
		.attr("width", 1200)
		.attr("height", 700);

	  // Add grey background lines for context.
	  background = svg.append("svg:g")
	      .attr("class", "background")
	    .selectAll("path")
	      .data(data)
	    .enter().append("svg:path")
	      .attr("d", path);

	  // Add blue foreground lines for focus.
	  foreground = svg.append("svg:g")
	      .attr("class", "foreground")
	    .selectAll("path")
	      .data(data)
	    .enter().append("svg:path")
	      .attr("d", path);

	  // Add a group element for each dimension.
	  var g = svg.selectAll(".dimension")
	      .data(dimensions)
	    .enter().append("svg:g")
	      .attr("class", "dimension")
	      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
	      .call(d3.behavior.drag()
		.on("dragstart", function(d) {
		  dragging[d] = this.__origin__ = x(d);
		  background.attr("visibility", "hidden");
		})
		.on("drag", function(d) {
		  dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
		  foreground.attr("d", path);
		  dimensions.sort(function(a, b) { return position(a) - position(b); });
		  x.domain(dimensions);
		  g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
		})
		.on("dragend", function(d) {
		  delete this.__origin__;
		  delete dragging[d];
		  transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
		  transition(foreground)
		      .attr("d", path);
		  background
		      .attr("d", path)
		      .transition()
		      .delay(500)
		      .duration(0)
		      .attr("visibility", null);
		}));

	  // Add an axis and title.
	  g.append("svg:g")
	      .attr("class", "axis")
	      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
	    .append("svg:text")
	      .attr("text-anchor", "middle")
	      .attr("y", -9)
	      .text(String);

	  // Add and store a brush for each axis.
	  g.append("svg:g")
	      .attr("class", "brush")
	      .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
	    .selectAll("rect")
	      .attr("x", -8)
	      .attr("width", 16);
	});
}


function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}