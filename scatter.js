// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top: 30, bottom: 30, left: 30, right: 30};

    // Create the SVG container
    const svg = d3.select("#scatterplot")
      .attr("width", width)
      .attr("height", height)
      .style('background', '#e9f7f2');
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength)-1, d3.max(data, d => d.PetalLength)+1])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth)-1, d3.max(data, d => d.PetalWidth)+1])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales
    let xAxis = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom().scale(xScale));

    let yAxis = svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft().scale(yScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("fill", d => colorScale(d.Species))
        .attr("r", 3);

    // Add x-axis label
    xAxis.append('text')
        .attr('x', width - margin.left - 5)
        .attr('y', -10)
        .style('stroke', 'black')
        .text('Petal Length');

    // Add y-axis label
    yAxis.append('text')
        .attr('y', 20)
        .attr('x', 28)
        .style('stroke', 'black')
        .text('Petal Width');

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("circle")
        .attr("cx", 70)
        .attr("cy", 55)
        .attr("r", 5)
        .attr("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 80)
        .attr("y", 55)
        .text(d => d)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
});