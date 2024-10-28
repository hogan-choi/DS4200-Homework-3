// Load the data
const iris = d3.csv("iris.csv");

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top: 30, bottom: 30, left: 30, right: 30};

    // Create the SVG container
    const svg = d3.select("#boxplot")
      .attr("width", width)
      .attr("height", height)
      .style('background', '#e9f7f2');

    // Set up scales for x and y axes
    let xScale = d3.scaleBand()
              .domain(data.map(d => d.Species))
              .range([margin.left, width - margin.right])
              .padding(0.5);

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength)-1, d3.max(data, d => d.PetalLength)+1])
        .range([height - margin.bottom, margin.top]);

    // Add scales     
    let xAxis = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom().scale(xScale));

    let yAxis = svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft().scale(yScale));

    // Add x-axis label
    xAxis.append('text')
        .attr('x', width - margin.left - 5)
        .attr('y', -10)
        .style('stroke', 'black')
        .text('Petal Species');

    // Add y-axis label
    yAxis.append('text')
        .attr('y', 20)
        .attr('x', 28)
        .style('stroke', 'black')
        .text('Petal Length');

    // Calculates all the necessary components for the IQR box plot.
    const rollupFunction = function(groupData) {
        // Sort the values of Petal Length in ascending order.
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        // Calculate the lower quartile by finding the 25th percentile.
        const q1 = d3.quantile(values, 0.25);
        // Calculate the median of Petal Length.
        const median = d3.quantile(values, 0.5);
        // Calculate the upper quartile by finding the 75th percentile.
        const q3 = d3.quantile(values, 0.75);
        // Calculate the Inter Quartile Range.
        const iqr = q3 - q1;
        // Find the minimum Petal Length (not outlier) by using the given formula.
        const min = q1 - (1.5 * iqr);
        // Find the maximum Petal Length (not outlier) by using the given formula.
        const max = q3 + (1.5 * iqr);
        // Return the minimum, first quartile, median, third quartile, and maximum Petal Lengths.
        return { min, q1, median, q3, max };
    };

    // Apply the rollupFunction on each Species in our Iris dataset.
    // Will have the minimum, first quartile, median, third quartile, and maximum
    // Petal Lengths for each species. 
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // For each species, visually represent the quartiles (min, q1, med, q3, max)
    // by drawing a box plot. 
    quartilesBySpecies.forEach((quartiles, Species) => {
        // The x position for each Species.
        const x = xScale(Species);
        // Calculate the box width with respect to xScale.
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + (boxWidth / 2)) // Makes sure the line is centered on Species x-axis.
            .attr("x2", x + (boxWidth / 2))
            .attr("y1", yScale(quartiles.min)) // Draw first y-point on the minimum point.
            .attr("y2", yScale(quartiles.max)) // Draw last y-point on the maximum point.
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x) // The starting x-point of the rectangle.
            .attr("y", yScale(quartiles.q3)) // The y-point for q3.
            .attr("height", (yScale(quartiles.q1) - yScale(quartiles.q3))) // Calculate the height of the box (subtract from q3 to get q1).
            .attr("width", boxWidth) // Put boxWidth as width of the rectangle.
            .attr("stroke", "black") // Outline the rectangle with black color.
            .style("fill", "#FFFFFF") // Fill the rectangle in white color to hide the vertical lines.

        // Draw median line
        svg.append("line")
            .attr("x1", x) // The starting x-point.
            .attr("x2", x + boxWidth) // The ending x-point (length of line should be equal to boxWidth).
            .attr("y1", yScale(quartiles.median)) // Draw the line on the median value.
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black")
    });
});