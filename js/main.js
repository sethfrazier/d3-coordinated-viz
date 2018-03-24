//begin script when window loads
window.onload = setMap();

//set up cloropleth map
function setMap(){
    
    //map frame dimensions
    var width = 960,
        height = 460;
    
    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
    
    //create Albers equal area conic projection centered on Washington
    var projection = d3.geoAlbers()
        .center([0, 47.24])
        .rotate([120.30, 0, 0])
        .parallels([45.0, 47.0])
        .scale(6000)
        .translate([width / 2, height / 2]);
    
    var path = d3.geoPath()
        .projection(projection);
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/wa_accident_data.csv")//load attributes from csv
        .defer(d3.json, "data/WashingtonCountyBoundaries.topojson")//load choropleth spatial data
        .await(callback);
    
    function callback(error, csvData, washington){
        //create graticule generator
        var graticule = d3.geoGraticule()
            .step([1,1]); //place graticule lines every 5 degrees of longitude and latitude
        
          //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule
        
        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
        
        
        //translate washington TopoJSON
        var washingtonCounties = topojson.feature(washington, washington.objects.WashingtonCountyBoundaries).features;
        
        //add washington counties to map
        var counties = map.selectAll(".counties")
            .data(washingtonCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "name " + d.properties.JURISDIC_2;
            })
            .attr("d", path);
            
        //examine the reults
        console.log(washingtonCounties);
        
        console.log(error);
        console.log(csvData);
        console.log(washington);
    }
};