<div class="atom interactive-wrapper-outer hecsFuture">
  <div id="outer-wrapper" class="showcase">
    <div class="row">

    <div class='figureTitle' id="chartTitle">How long could it take you to pay off your Help/Hecs debt?</div>
    <div class='subTitle' id="subTitle">Put in your current Help debt and your annual income to get a rough estimate of how long it could take you to pay off your debt.
      The chart shows the <span class="red">money added from indexation each year</span>, <span class="blue">compulsory and voluntary repayments each year</span>, and then the <span class="orange">total debt over time</span>.
      This model assumes wage growth increases steeply after graduation, then tapers downwards over nine years to the historical average wage growth. You can also change the average indexation rate, or the average rate of wage growth, or leave them as they are </div>
    <div class='notes' id='chartKey'>
      <div  class="controlBlock">
        Your current debt:  <input type="number" min="5000" max="200000" step="5000" bind:value={starting_debt}  >
      </div>
      <!-- <div  class="controlBlock">
        Your income (hourly): <input type="number" min="15.00" max="60.00" step="1" bind:value={starting_hourly_rate} on:change={updateSalary} >
      </div> -->
      <div  class="controlBlock">
        Pre-tax annual income*:  <input type="number" min="10000" max="500000" step="5000" bind:value={starting_salary}>
      </div>

      <div  class="controlBlock">
        Annual voluntary repayments*:  <input type="number" min="0" max="500000" step="100" bind:value={starting_voluntary_repayment}>
      </div>

      <div  class="controlBlock">
        Graduation year**:  <input type="number" min="1980" max="2023" step="1" bind:value={grad_year}>
      </div>

      <div  class="controlBlock">
        Average indexation (CPI/WPI)***:  <input type="number" min="0.1" max="10" step="0.1" bind:value={starting_indexation}>
      </div>

      <div  class="controlBlock">
        Average wage growth:  <input type="number" min="0.1" max="10" step="0.1" bind:value={wage_growth}>
      </div>
  
      
    </div>
    
    </div>
    <div class="message">
      Indexation will add <span class="red">${Math.round(0.04 * starting_debt)}</span> to your Help debt in 2024
    </div>
    <div class="row borderBottom chartSans" id="graphicContainer">
        <div id="loadingContainer">Loading...</div>
    </div>

    <div class="message">
      {#if total_years == 80}
      Based on your income and average inflation and wage growth you may <span class="orange">never</span> pay off your Help debt
      {:else}
      Based on your income and average inflation and wage growth, it could take you <span class="orange">{total_years} years</span> to pay off your Help debt
      {/if}
      
    </div>
    <div class="row borderBottom chartSans" id="graphicContainer2">
  
    </div>
    <div class='footer offset'>
      <div id="footerAnnotations">

      </div>	
      
      <span id="footnote"></span> Guardian graphic <span id="sourceText"> | * Income and voluntary payments are adjusted each year by the average wage growth amount. ** Assumes wage growth post-graduation increases sharply then tapers downwards over the following years, using figures based on the <a href="https://www.qilt.edu.au/general/article/2021/11/04/graduate-incomes-data">QILT Graduate incomes data report</a>. *** Help debt and repayment thresholds are re-indexed yearly using a formula based on whichever is lower of the consumer price index (inflation) and the wage price index</span>
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
  
  .message {
    font-family: "Guardian Headline Full", Georgia, serif;
    margin-bottom: 15px;
    font-size: 18px;
  }

  .red {
    color:rgb(204, 10, 17);
    font-weight: bold;
  }

  .orange {
    color:#ff7f00;
    font-weight: bold;
  }

</style>


<script>
  export let name = "atom";
  import repayment_rates from "$lib/data/repayments.json"
  import indexation_rates from "$lib/data/indexation.json"
  import * as d3 from "d3"
  import { onMount } from 'svelte';

  let model = []
  // let years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
  let starting_debt = 30000

  //2.3
  let wage_growth = 2.3
  let starting_indexation = 2.8
  let hours_in_year = 1976
  let total_years = 0
  let grad_year = 2023
  let starting_voluntary_repayment = 0
  // let starting_hourly_rate = 24.00
  let starting_salary = 60000
  let starting_thresholds = [
  {"bracket":48361,"rate":0.000,"year":2023},
  {"bracket":55836,"rate":0.010,"year":2023},
  {"bracket":59186,"rate":0.020,"year":2023},
  {"bracket":62738,"rate":0.025,"year":2023},
  {"bracket":66502,"rate":0.030,"year":2023},
  {"bracket":70492,"rate":0.035,"year":2023},
  {"bracket":74722,"rate":0.040,"year":2023},
  {"bracket":79206,"rate":0.045,"year":2023},
  {"bracket":83958,"rate":0.050,"year":2023},
  {"bracket":88996,"rate":0.055,"year":2023},
  {"bracket":94336,"rate":0.060,"year":2023},
  {"bracket":99996,"rate":0.065,"year":2023},
  {"bracket":105996,"rate":0.070,"year":2023},
  {"bracket":112355,"rate":0.075,"year":2023},
  {"bracket":119097,"rate":0.080,"year":2023},
  {"bracket":126243,"rate":0.085,"year":2023},
  {"bracket":133818,"rate":0.090,"year":2023},
  {"bracket":141847,"rate":0.095,"year":2023},
  {"bracket":1000000000,"rate":0.100,"year":2023}
  ]

    let grad_wagegrowth = [{"period":1,"wage_growth":13.08},
  {"period":2,"wage_growth":11.94},
  {"period":3,"wage_growth":8.33},
  {"period":4,"wage_growth":8.00},
  {"period":5,"wage_growth":6.00},
  {"period":6,"wage_growth":5.00},
  {"period":7,"wage_growth":4.62},
  {"period":8,"wage_growth":4.17},
  {"period":9,"wage_growth":4.00}]

  let updateChart = function() {};

  function generateData() {
    console.log("generating data")
    model = []

    for (let i = 0; i < 80; i++) {
      console.log("i", i)
      if (i == 0) {

        let year = 2023
        let salary = starting_salary
        let repayment_rate = starting_thresholds.filter(r => salary < r.bracket)[0].rate
        console.log()
        let repayment = repayment_rate * salary
        if (grad_year == 2023) {
          repayment = 0
        }
        
        let indexation_rate = 0.032
        let indexation = indexation_rate * (starting_debt - starting_voluntary_repayment)
        let help_debt = starting_debt + indexation - repayment - starting_voluntary_repayment
        let thresholds = starting_thresholds
        let total_repayments = repayment + starting_voluntary_repayment
        let newRow = {
          year: year,
          salary: salary,
          repayment_rate: repayment_rate,
          repayment: repayment,
          indexation: indexation,
          help_debt:starting_debt,
          thresholds: thresholds,
          voluntary_repayments: starting_voluntary_repayment,
          total_repayments: total_repayments,
          wage_growth: 0
        }
        model.push(newRow)
      }

      
      else {

        let year = model[i-1].year + 1
        let new_wage_growth = wage_growth

        let growth_index = i + (2023 - grad_year)
        console.log("growth_index", growth_index)
        if (i <= 9 && growth_index <= 9) {
          // let adjusted_i = i + growth_index
          
          new_wage_growth = grad_wagegrowth.filter(r => growth_index == r.period)[0].wage_growth
          console.log("using", new_wage_growth)
        }
        let salary = model[i-1].salary + (model[i-1].salary * (new_wage_growth / 100))
        let thresholds = JSON.parse(JSON.stringify(model[i-1].thresholds))
        thresholds.forEach((d) => {
          d.bracket = d.bracket + (d.bracket * (starting_indexation / 100))
        })
        
        let repayment_rate = thresholds.filter(r => salary < r.bracket)[0].rate
        let repayment = repayment_rate * salary
        let voluntary_repayments = model[i-1].voluntary_repayments + (model[i-1].voluntary_repayments * (wage_growth / 100))
        let indexation = (starting_indexation / 100) * (model[i-1].help_debt - voluntary_repayments)
       
        // adjust for known 2024 amount

        if (i == 1) {
          indexation = 0.04 * (model[i-1].help_debt - voluntary_repayments)
        }
        
        let help_debt = model[i-1].help_debt + indexation - repayment - voluntary_repayments
        let total_repayments = repayment + voluntary_repayments
        help_debt = help_debt <= 0 ? 0 : help_debt
       
        let newRow = {
          year: year,
          salary: salary,
          repayment_rate: repayment_rate,
          repayment: repayment,
          indexation: indexation,
          help_debt:help_debt,
          thresholds: thresholds,
          voluntary_repayments: voluntary_repayments,
          total_repayments:total_repayments,
          wage_growth: new_wage_growth
        }

        model.push(newRow)
        if (help_debt == 0) {
          console.log("break? ")
          break
        }

      }

  
    }

    total_years = model.length
    console.log("newData", model)
    updateChart()
  }

  generateData()

  
  // $: starting_debt !== null && starting_debt !== undefined &&
  //  starting_salary !== null && starting_salary !== undefined &&
  //  starting_indexation !== null && starting_indexation !== undefined &&
  //  wage_growth !== null && wage_growth !== undefined &&
  //  starting_voluntary_repayment !== null && starting_voluntary_repayment !== undefined &&
  //  generateData();

  $: starting_debt && generateData();
  $: starting_salary && generateData();
  $: grad_year && generateData();
  $: wage_growth && generateData();
  $: starting_indexation && generateData();
  $: starting_voluntary_repayment && generateData();

  onMount(() => {
    

    const context = d3.select(".hecsFuture")
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

    let y1Max = d3.max([d3.max(model, d=> d.indexation), d3.max(model, d=> d.total_repayments)])
    let y1Min = d3.min([d3.min(model, d=> d.indexation), d3.min(model, d=> d.total_repayments)])

    x1.domain(d3.extent(model, d => d.year));
    y1.domain([y1Min, y1Max])

    y2.domain(d3.extent(model, d => d.help_debt))
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
      .attr("class", "x axis xAxis")
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
      .attr("class", "x axis xAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)     

    let indexation_line = d3.line().x((d) => x1(d.year)).y((d) => y1(d.indexation))
    let repayment_line = d3.line().x((d) => x1(d.year)).y((d) => y1(d.total_repayments))
    let helpdebt_line = d3.line().x((d) => x1(d.year)).y((d) => y2(d.help_debt))
    let lineLabelOffset = 4
    features1
      .append("path")
      .datum(model)
      .attr("fill", "none")
      .attr("id", "indexation_line")
      .attr("stroke", "rgb(204, 10, 17)")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4)
      .attr("d", indexation_line)

      features1
          .append("circle")
          .attr("cy", y1(model[model.length - 1].indexation))
          .attr("fill", "rgb(204, 10, 17)")
          .attr("cx", x1(model[model.length - 1].year))
          .attr("id", "indexation_circle")
          .attr("r", 5)
          .style("opacity", 1)

          features1
                .append("text")
                .attr("class", `lineLabels`)
                .style("font-weight","bold")
                .style("font-size","15px")
                .attr("y", y1(model[model.length - 1].indexation) + lineLabelOffset)
                .attr("x", x1(model[model.length - 1].year) + 6)
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
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("d", repayment_line)  

      features1
          .append("circle")
          .attr("cy", y1(model[model.length - 1].total_repayments))
          .attr("fill", "rgb(4, 109, 161)")
          .attr("cx", x1(model[model.length - 1].year))
          .attr("id", "repayment_circle")
          .attr("r", 5)
          .style("opacity", 1)  

          features1
                .append("text")
                .attr("class", `lineLabels`)
                .style("font-weight","bold")
                .style("font-size","15px")
                .attr("y", y1(model[model.length - 1].total_repayments) + lineLabelOffset)
                .attr("x", x1(model[model.length - 1].year) + 6)
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
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("d", helpdebt_line)  

        features2
          .append("circle")
          .attr("cy", y2(model[model.length - 1].help_debt))
          .attr("fill", "#ff7f00")
          .attr("cx", x1(model[model.length - 1].year))
          .attr("id", "helpdebt_circle")
          .attr("r", 5)
          .style("opacity", 1)   
          
          features2
                .append("text")
                .attr("class", `lineLabels`)
                .style("font-weight","bold")
                .style("font-size","15px")
                .attr("id", "helpdebt_label")
                .attr("y", y2(model[model.length - 1].help_debt) + lineLabelOffset)
                .attr("x", x1(model[model.length - 1].year) + 6)
                .style("opacity", 1)
                .attr("text-anchor", "start")
                .attr("fill", "#ff7f00")
                .text("Debt")      

      updateChart = function () {

        console.log("updating...")

        y1Max = d3.max([d3.max(model, d=> d.indexation), d3.max(model, d=> d.total_repayments)])
        y1Min = d3.min([d3.min(model, d=> d.indexation), d3.min(model, d=> d.total_repayments)])
        x1.domain(d3.extent(model, d => d.year));
        
        context.selectAll(".xAxis")
        .transition()
         .call(xAxis)
        
        y1.domain([y1Min, y1Max])
        y2.domain(d3.extent(model, d => d.help_debt))
        


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
            .attr("cy", y1(model[model.length - 1].total_repayments))
        
            context.select("#repayment_label")
        .transition()
        .attr("y", y1(model[model.length - 1].total_repayments) + lineLabelOffset)    
          

        context.select("#indexation_line")
          .datum(model)
          .transition()
          .attr("d", indexation_line)  

          context.select("#indexation_circle")
            .transition()
            .attr("cy", y1(model[model.length - 1].indexation))

            context.select("#indexation_label")
            .transition()
            .attr("y", y1(model[model.length - 1].indexation) + lineLabelOffset)    

            context.select("#helpdebt_line")
          .datum(model)
          .transition()
          .attr("d", helpdebt_line)    

          context.select("#helpdebt_circle")
            .transition()
            .attr("cy", y2(model[model.length - 1].help_debt))

            context.select("#helpdebt_label")
            .transition()
            .attr("y", y2(model[model.length - 1].help_debt) + lineLabelOffset)  

      }

  });


  


</script>