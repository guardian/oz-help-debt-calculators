<div class="atom interactive-wrapper-outer hecsCurrent">
  <div id="outer-wrapper" class="showcase">
    <div class="row">

    <div class='figureTitle' id="chartTitle">See how indexation can change the overall Help debt</div>
    <div class='subTitle' id="subTitle">This shows how the <span class="blue">money added from indexation each year</span> can change a person's <span class="orange">total Help/Hecs debt</span> over a ten year period, and when <span class="red">compulsory repayments made each year</span> are outweighed by indexation. Use the controls to change starting debt or income level</div>
    <div class='notes' id='chartKey'>
      <div  class="controlBlock">
        Debt on graduation:  <input type="number" min="5000" max="100000" step="5000" bind:value={starting_debt}  >
      </div>
      <!-- <div  class="controlBlock">
        Starting pre-tax hourly rate: <input type="number" min="15.00" max="60.00" step="1" bind:value={starting_hourly_rate} on:change={updateSalary} >
      </div> -->
      <div  class="controlBlock">
        Starting pre-tax annual income:  <input type="number" min="10000" max="500000" step="5000" bind:value={starting_salary} on:change={updateHourly}>
      </div>
  
      <div id="mobKey">

      </div>
    </div>
    
    </div>
    <div class="row borderBottom chartSans" id="graphicContainer">
        <div id="loadingContainer">Loading...</div>
    </div>
    <div class="row borderBottom chartSans" id="graphicContainer2">
  
    </div>
    <div class='footer offset'>
      <div id="footerAnnotations">

      </div>	
      
      <span id="footnote"></span> Guardian graphic <span id="sourceText"> | Data source: ABS, ATO, atotaxrates.info. Assumes wage growth post-graduation increases sharply then tapers downwards over the following years, using figures based on the <a href="https://www.qilt.edu.au/general/article/2021/11/04/graduate-incomes-data">QILT Graduate incomes data report</a></span>
    </div>	
    
</div>
</div>

<style lang="scss" global>
  h2 {
    @include f-headline();
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  #graphicContainer, #graphicContainer2 {
    margin-bottom:20px;
  }

  .atom {
    background-color: white;
  }
  
</style>


<script>
  export let name = "atom";
  import repayment_rates from "$lib/data/repayments.json"
  import indexation_rates from "$lib/data/indexation.json"
  import * as d3 from "d3"
  import { onMount } from 'svelte';
    import { not_equal } from "svelte/internal";

  let model = []
  let years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
  let starting_debt = 30000


  let grad_wagegrowth = [{"period":1,"wage_growth":13.08},
  {"period":2,"wage_growth":11.94},
  {"period":3,"wage_growth":8.33},
  {"period":4,"wage_growth":8.00},
  {"period":5,"wage_growth":6.00},
  {"period":6,"wage_growth":5.00},
  {"period":7,"wage_growth":4.62},
  {"period":8,"wage_growth":4.17},
  {"period":9,"wage_growth":4.00},
  {"period":10,"wage_growth":2.25}]

  let assumptions = {
  "hours_in_year":1976,
  "wage_growth": 0.023,
  "inflation":0.025,
  "hours_modifier":1.0,
  "starting_debt":40000,
  "start_year":2014
  }

  let starting_hourly_rate = 15.00
  let starting_salary = starting_hourly_rate * assumptions.hours_in_year

  const setHourly = (new_salary) => {
    starting_hourly_rate = parseFloat((new_salary / assumptions.hours_in_year).toFixed(2))
  }

  function updateHourly(event) {
    starting_hourly_rate = parseFloat((starting_salary / assumptions.hours_in_year).toFixed(2))
  }

  function updateSalary(event) {
    starting_salary = starting_hourly_rate * assumptions.hours_in_year
  }

  // const setSalary = (new_hourly_rate) => {
  //   starting_hourly_rate = parseInt((new_hourly_rate * assumptions.hours_in_year))
  // }

  // $: setHourly(starting_salary);
  // $: setSalary(starting_hourly_rate);

  let updateChart = function() {};

  function generateData() {
    console.log("generating data")
    model = []
    years.forEach((year,i) => {
      if (i == 0) {
        let newRow = {
          year: year,
          age: 20 + i,
          salary: starting_hourly_rate * assumptions.hours_in_year,
          hourly_rate: starting_hourly_rate,
          worked_hours: assumptions.hours_in_year * assumptions.hours_modifier,
          repayment_rate: 0,
          repayment: 0,
          indexation_rate: 0,
          indexation: 0,
          help_debt:starting_debt
        }
        model.push(newRow)
      }

      else {
        let newYear = year
        let age = 20 + i

        let wage_growth = (grad_wagegrowth.filter(r => r.period == i )[0].wage_growth) / 100
        let hourly_rate = model[i-1].hourly_rate + (wage_growth * model[i-1].hourly_rate)
        let worked_hours = assumptions.hours_in_year * assumptions.hours_modifier
        let salary = hourly_rate * worked_hours
        let repayment_rate = repayment_rates.filter(r => r.year == year && salary < r.bracket)[0].rate
        let repayment = repayment_rate * salary
        let indexation_rate = indexation_rates.filter(r => r.year == year)[0].rate
        let indexation = indexation_rate * model[i-1].help_debt
        let help_debt = (model[i-1].help_debt + indexation) - repayment
        help_debt = help_debt <= 0 ? 0 : help_debt
        
        if (model[i-1].help_debt == 0 || model[i-1].help_debt == null) {
          help_debt = null
          repayment = null
          indexation = null
        }

        let newRow = {
          year: newYear,
          age: age,
          salary: salary,
          hourly_rate: hourly_rate,
          worked_hours: worked_hours,
          repayment_rate: repayment_rate,
          repayment: repayment,
          indexation_rate: indexation_rate,
          indexation: indexation,
          help_debt:help_debt,
          wage_growth:wage_growth
        }
        model.push(newRow)

      }
      
    })
    console.log("newData", model)
    updateChart()
  }

  generateData()

  

  
  $: starting_debt && starting_salary && starting_hourly_rate && generateData();

  onMount(() => {
    
    
    const context = d3.select(".hecsCurrent")
    context.select("#loadingContainer").remove();
    
    let width = document.querySelector(`#graphicContainer`).getBoundingClientRect().width
    let height = 300
    let margin = {top: 10, right: 95, bottom: 20, left:60}

    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
    console.log("width", width)
    const svg1 = context.select("#graphicContainer").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("id", "svg1")
          .attr("overflow", "hidden");

    const svg2 = context.select("#graphicContainer2").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("id", "svg2")
          .attr("overflow", "hidden");

    const features1 = svg1.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");     
    const features2 = svg2.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

    var x1 = d3.scaleLinear()
      .range([0, width]);

    var y1 = d3.scaleLinear()
      .range([height, 0]);  

    var x2 = d3.scaleLinear()
      .range([0, width]);

    var y2 = d3.scaleLinear()
      .range([height, 0]);  

    let y1Max = d3.max([d3.max(model, d=> d.indexation), d3.max(model, d=> d.repayment)])
    let y1Min = d3.min([d3.min(model, d=> d.indexation), d3.min(model, d=> d.repayment)])

    x1.domain(d3.extent(model, d => d.year));
    y1.domain([y1Min, y1Max])

    y2.domain([0, d3.max(model, d => d.help_debt)])
    console.log(y2.domain())
    const xAxis = d3.axisBottom(x1).ticks(5).tickFormat(d3.format("d"))
    
    const yAxis1 = d3
      .axisLeft(y1)
      .ticks(5)
      .tickSize(-width) 

    const yAxis2 = d3
      .axisLeft(y2)
      .ticks(5)
      .tickSize(-width)   

    features1.append("g")
          .attr("class", "y dashed axis")
          .attr("id", "yAxis1")
          .call(yAxis1)
          .style("stroke-dasharray", "2 2")
          .attr("stroke-width", 3) 

    features1
      .select(".y .domain")
      .remove()       

    features1
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)    
      
      
    features2.append("g")
          .attr("class", "y dashed axis")
          .attr("id", "yAxis2")
          .call(yAxis2)
          .style("stroke-dasharray", "2 2")
          .attr("stroke-width", 3) 

    features2
      .select(".y .domain")
      .remove()       

    features2
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)     

    let indexation_line = d3.line().x((d) => x1(d.year)).y((d) => y1(d.indexation)).defined( (d) => d.indexation != null)
    let repayment_line = d3.line().x((d) => x1(d.year)).y((d) => y1(d.repayment)).defined( (d) => d.repayment!= null)
    let helpdebt_line = d3.line().x((d) => x1(d.year)).y((d) => y2(d.help_debt)).defined( (d) => d.help_debt != null)
    let lineLabelOffset = 4

    let nonNull = model.filter(r => r.help_debt != null)
    features1
      .append("path")
      .datum(model)
      .attr("fill", "none")
      .attr("id", "indexation_line")
      .attr("stroke", "rgb(204, 10, 17)")
      .attr("stroke-width", 4)
      .attr("d", indexation_line)

      features1
          .append("circle")
          .attr("cy", y1(nonNull[nonNull.length - 1].indexation))
          .attr("fill", "rgb(204, 10, 17)")
          .attr("cx", x1(nonNull[nonNull.length - 1].year))
          .attr("id", "indexation_circle")
          .attr("r", 5)
          .style("opacity", 1)

          features1
                .append("text")
                .attr("class", `lineLabels`)
                .style("font-weight","bold")
                .style("font-size","15px")
                .attr("y", y1(nonNull[nonNull.length - 1].indexation) + lineLabelOffset)
                .attr("x", x1(nonNull[nonNull.length - 1].year) + 6)
                .style("opacity", 1)
                .attr("id", "indexation_label")
                .attr("text-anchor", "start")
                .attr("fill", "rgb(204, 10, 17)")
                .text("Indexation")

      features1
        .append("path")
        .datum(model)
        .attr("fill", "none")
        .attr("stroke", "rgb(4, 109, 161)")
        .attr("id", "repayment_line")
        .attr("stroke-width", 4)
        .attr("d", repayment_line)  

      features1
          .append("circle")
          .attr("cy", y1(nonNull[nonNull.length - 1].repayment))
          .attr("fill", "rgb(4, 109, 161)")
          .attr("cx", x1(nonNull[nonNull.length - 1].year))
          .attr("id", "repayment_circle")
          .attr("r", 5)
          .style("opacity", 1)  

          features1
                .append("text")
                .attr("class", `lineLabels`)
                .style("font-weight","bold")
                .style("font-size","15px")
                .attr("y", y1(nonNull[nonNull.length - 1].repayment) + lineLabelOffset)
                .attr("x", x1(nonNull[nonNull.length - 1].year) + 6)
                .style("opacity", 1)
                .attr("id", "repayment_label")
                .attr("text-anchor", "start")
                .attr("fill", "rgb(4, 109, 161)")
                .text("Repayments")    

      features2
        .append("path")
        .datum(model)
        .attr("fill", "none")
        .attr("stroke", "#ff7f00")
        .attr("id", "helpdebt_line")
        .attr("stroke-width", 4)
        .attr("d", helpdebt_line)  

        features2
          .append("circle")
          .attr("cy", y2(nonNull[nonNull.length - 1].help_debt))
          .attr("fill", "#ff7f00")
          .attr("cx", x1(nonNull[nonNull.length - 1].year))
          .attr("id", "helpdebt_circle")
          .attr("r", 5)
          .style("opacity", 1)   
          
          features2
                .append("text")
                .attr("class", `lineLabels`)
                .style("font-weight","bold")
                .style("font-size","15px")
                .attr("id", "helpdebt_label")
                .attr("y", y2(nonNull[nonNull.length - 1].help_debt) + lineLabelOffset)
                .attr("x", x1(nonNull[nonNull.length - 1].year) + 6)
                .style("opacity", 1)
                .attr("text-anchor", "start")
                .attr("fill", "#ff7f00")
                .text("Debt")      

      updateChart = function () {

        console.log("updating...")
        nonNull = model.filter(r => r.help_debt != null)
        console.log("not null", nonNull)
        y1Max = d3.max([d3.max(model, d=> d.indexation), d3.max(model, d=> d.repayment)])
        y1Min = d3.min([d3.min(model, d=> d.indexation), d3.min(model, d=> d.repayment)])
        y1.domain([y1Min, y1Max])
        y2.domain([0, d3.max(model, d => d.help_debt)])
        
        context.select("#yAxis1")
        .transition()
         .call(yAxis1)
         .style("stroke-dasharray", "2 2")
          .attr("stroke-width", 3) 

        features1
          .select(".y .domain")
          .remove()  

          context.select("#yAxis2")
        .transition()
         .call(yAxis2)
         .style("stroke-dasharray", "2 2")
          .attr("stroke-width", 3) 

        features2
          .select(".y .domain")
          .remove()  

          context.select("#repayment_line")
          .datum(model)
          .transition()
          .attr("d", repayment_line)

          context.select("#repayment_circle")
            .transition()
            .attr("cy", y1(nonNull[nonNull.length - 1].repayment))
            .attr("cx", x1(nonNull[nonNull.length - 1].year))
        
            context.select("#repayment_label")
        .transition()
        .attr("y", y1(nonNull[nonNull.length - 1].repayment) + lineLabelOffset)    
        .attr("x", x1(nonNull[nonNull.length - 1].year) + 6) 

        context.select("#indexation_line")
          .datum(model)
          .transition()
          .attr("d", indexation_line)  

          context.select("#indexation_circle")
            .transition()
            .attr("cy", y1(nonNull[nonNull.length - 1].indexation))
            .attr("cx", x1(nonNull[nonNull.length - 1].year))

            context.select("#indexation_label")
            .transition()
            .attr("y", y1(nonNull[nonNull.length - 1].indexation) + lineLabelOffset)
            .attr("x", x1(nonNull[nonNull.length - 1].year) + 6)    

            context.select("#helpdebt_line")
          .datum(model)
          .transition()
          .attr("d", helpdebt_line)    

          context.select("#helpdebt_circle")
            .transition()
            .attr("cy", y2(nonNull[nonNull.length - 1].help_debt))
            .attr("cx", x1(nonNull[nonNull.length - 1].year))

            context.select("#helpdebt_label")
            .transition()
            .attr("y", y2(nonNull[nonNull.length - 1].help_debt) + lineLabelOffset)
            .attr("x", x1(nonNull[nonNull.length - 1].year) + 6)   

      }

  });


  


</script>