//wrap everything in a self-executing anonymous function
(function(){
    
    //variables for data join
    var attrArray = ["total_collisions", "pct_WaTotal", "pct_fatal", "pct_serious", "pct_minor","pct_property", "pct_unknown", "Col_per_licDR", "fatal_perLicDr", "serious_injry_perLicDr" ];
    
    var expressed = attrArray[0]; //initial attribute

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

            //place graticule on the map
            setGraticule(map,path);
        
        
            //translate washington TopoJSON
            var washingtonCounties = topojson.feature(washington, washington.objects.WashingtonCountyBoundaries).features;


            //join csv data to GeoJSON enumeration units
            washingtonCounties = joinData(washingtonCounties, csvData);

            //add enumeration units to the map
            setEnumerationUnits(washingtonCounties, map, path);          

            console.log(washingtonCounties);
        
        }
    };

    function setGraticule(map, path){
        //create graticule generator
        var graticule = d3.geoGraticule().step([1,1]); //place graticule lines every 5 degrees of longitude and latitude

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

    };

    function joinData(washingtonCounties, csvData){
        //loop through csv to assign each set of csv attribute values to geojson region
            for (var i=0; i<csvData.length; i++){
                var csvCounty = csvData[i]; //the current region
                var csvKey = csvCounty.JURISDIC; //the CSV primary key

                //loop through geojson counties to find correct county
                for (var a=0; a<washingtonCounties.length; a++){

                    var geojsonProps = washingtonCounties[a].properties; //the current county geojson properties
                    var geojsonKey = geojsonProps.JURISDIC_4; //the geojson primary key

                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey){

                         //assign all attributes and values
                        attrArray.forEach(function(attr){
                            var val = parseFloat(csvCounty[attr]); //get csv attribute value
                            geojsonProps[attr] = val; //assign attribute and value to geojson properties
                        });
                    };
                };
            };

        return washingtonCounties;
    };

    function setEnumerationUnits(washingtonCounties, map, path){
    //add washington counties to map
            var counties = map.selectAll(".counties")
                .data(washingtonCounties)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "name " + d.properties.JURISDIC_4;
                })
                .attr("d", path);

            //examine the reults
            //console.log(washingtonCounties);

            //console.log(error);
            //console.log(csvData);
            //console.log(washington);
    };
})();