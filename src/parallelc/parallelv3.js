var m ,//
    w, //calcula a largura das colunas
    h; //calcula a altura das colunas
    colunas = 3; //numero de colunas a serem plotados
    campos = 0; // para contar o numero de campos, isso evita de ficar declarando a variavel em toda funcao

var x,
    y = {},
    dragging = {};

var line = d3.svg.line().defined(function(d) { return !isNaN(d[1]); }),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg;

var tooltip;


//@width  largura do svg
//@height altura do svg
function buildSvg(width, height,body){	
	
	d3.select(body).select("svg").remove();
	svg = d3.select(body);
	svg = d3.select(body).append("svg")
		.attr("width", width)
		.attr("height", height);

	tooltip = d3.select(body)
		.append("div")	//TODO ver isso depois
		.style("position", "absolute","red")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.style("stroke","red")	

}

//@inicia as variaveis iniciais das cordenadas paralelas e instancia o svg
//@width  largura do svg
//@height altura do svg
function init(width, height,body){
	m = [10, 10, 10, 10],
	w = width - m[1] - m[3],  //calcula a largura das colunas
        h = height - m[0] - m[2];  //calcula a altura das colunas

        x = d3.scale.ordinal().rangePoints([0, w], 1);	
	buildSvg(width, height,body);
}

//@ smin = valor minimo da escala da coluna
//@ smax = valor maximo da escala da coluna
//@ col = numero de colunas a ser plotado
//OBS. para nao processar a coluna especificada colocar o caractere '#' no inicio do nome do campo
function executa(data_file, smin,smax,col){
	colunas = col;
	d3.csv(data_file, function(data) {
	campos = 0;
	  // Extract the list of dimensions and create a scale for each.
	  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
		campos +=1;
		//console.info("campos = "+campos);
		
		//mostre apenas o numero de colunas especificado
		if (campos <= colunas){
			    //d[0] != "1" -> se o primeiro caractere do nome do campo for 1 entao nao 'adicione' a coluna
			    return d[0] != "1" && (y[d] = d3.scale.linear()
				.domain([smin,smax])
				.range([h, 0]));
		}
	  }));
	
	

	  // pinta as linhas estrangeiras de cinza
	  background = svg.append("svg:g")
	      .attr("class", "background")
	    .selectAll("path")
	      .data(data)
	    .enter().append("svg:path")
	      .attr("d", path);

	  // pinta as linhas que estao focadas de azul
	  foreground = svg.append("svg:g")
	      .attr("class", "foreground")
	    .selectAll("path")
	      .data(data)
	    .enter().append("svg:path")
	      .attr("d", path);

	  // Add a group element for each dimension.
	  campos = 0;
	  var g = svg.selectAll(".dimension")
	      .data(dimensions)
	    .enter().append("svg:g")
	      .attr("class", "dimension")
	      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
	      .call(d3.behavior.drag()		 
			//opcional = moveColunas()
		);
		//mostra as colunas
		showAxis(g);
	 
         var projection = svg.selectAll(".background path,.foreground path")
             .on("mouseover", mouseover)
             .on("mouseout", mouseout);

	  function mouseover(d) {
	    
	    svg.classed("active", true);
	    projection.classed("inactive", function(p) { return p !== d; });
	    projection.filter(function(p) { return p === d; }).each(moveToFront);
	    tooltip.text(d.nota1);
	    return tooltip.style("visibility", "visible");
	  }

	  function mouseout(d) {	   
	    
	    svg.classed("active", false);
	    projection.classed("inactive", false);
	    return tooltip.style("visibility", "hidden");
	  }

	  function moveToFront() {
	    this.parentNode.appendChild(this);
	  }

	});
}


function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// retorna um caminho com todos os pontos referente a um objeto.
function path(d) {
  campos = 0;


  	   return line(dimensions.map(function(p) { 
	       campos += 1;
	     
	       //se a nota for == -1.0 nao mostre a linha (consequentemente o caminho sera quebrado)
	       if (d[p] == -1.0) return [,]; //TODO encontrar uma forma de retirar as notas inexistentes

	       //console.info([position(p), y[p](d[p])])
	      		 //(x,y)
	       return [position(p), y[p](d[p])]; 
	     

             }));
}

// Handles a brush event, toggling the display of foreground lines.
//esta linha e utilizada para selecionar um intervalo em uma determinada coluna
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
		
	return actives.every(function(p, i) {
	return extents[i][0] <= d[p] && d[p] <= extents[i][1];}) ? null : "none";
		

  });
}

function showAxis(g){
 // Add an axis and title.
  campos = 0; //para contar o numero de colunas	
  g.append("svg:g")
      .attr("class", "axis")
      .each(function(d) { 
		campos += 1;
		console.info(campos);			
		
		//limita o numero de colunas a ser plotado
		if (campos <= colunas)
		   d3.select(this).call(axis.scale(y[d])); 

	})
    .append("svg:text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String);

  // Add and store a brush for each axis.
  //executa a quantidade de campos a serem plotados

 
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { 
	     d3.select(this).call(
             y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); 
			
       })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
}

//-------------------para permitir mover as colunas colocar isso-----------------------
/*function moveColunas(){
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
	})

);
}*/














