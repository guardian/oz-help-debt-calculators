<script>
  export let name = "atom";
  import { onMount } from 'svelte';
  import { not_equal } from "svelte/internal";

//   let repayment_rates = [
//   {"bracket":51550,"rate":0},
//   {"bracket":59518,"rate":0.010},
//   {"bracket":63089,"rate":0.020},
//   {"bracket":66875,"rate":0.025},
//   {"bracket":70888,"rate":0.030},
//   {"bracket":75140,"rate":0.035},
//   {"bracket":79649,"rate":0.040},
//   {"bracket":84429,"rate":0.045},
//   {"bracket":89494,"rate":0.050},
//   {"bracket":94865,"rate":0.055},
//   {"bracket":100557,"rate":0.060},
//   {"bracket":106590,"rate":0.065},
//   {"bracket":112985,"rate":0.070},
//   {"bracket":119764,"rate":0.075},
//   {"bracket":126950,"rate":0.080},
//   {"bracket":134568,"rate":0.085},
//   {"bracket":142642,"rate":0.090},
//   {"bracket":151200,"rate":0.095},
//   {"bracket":151201,"rate":0.100}
// ]

let repayment_rates = [{"bracket":48361,"rate":0.000,"year":2023},
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
{"bracket":141847,"rate":0.095,"year":2023}]

  let cpi_index_2023 = 0.071
  let cpi_index_2024 = 0.047

  let wpi_index_2023 = 0.032
  let wpi_index_2024 = 0.04

  let income = 60000
  let repayment_rate = 0.025
  $: {
    let filter_rates = repayment_rates.filter(r => income < r.bracket)
    if (filter_rates.length > 0) {
      repayment_rate = filter_rates[0].rate
    }

    else {
      repayment_rate = 0.1
    }

  }
  $:{
    console.log("repayment_rate",repayment_rate, repayment_rates.filter(r => income < r.bracket))
  }
  
  // repayment ba


  // Debt as at 1 June 2023 (ie after the 7.1% indexation was applied)  
  let starting_debt = 50000
  $: thing = starting_debt / 5
  // 2023 debt under CPI indexation scheme
  $: old_debt_2023 = starting_debt

  // 2023 debt under CPI indexation less 7.8%
  $: old_debt_2023_pre = starting_debt / (1 + cpi_index_2023)

  // Actual 7.8% amount of the old debt
  $: cpi_indexation_2023 = old_debt_2023_pre * cpi_index_2023

  console.log("cpi_indexation_2023",cpi_indexation_2023)
  // 2024 debt under CPI indexation scheme

  // Repayment is based on the unindexed 2023 amount

  $: old_repayment_2023 = old_debt_2023_pre * repayment_rate

  $: console.log(old_repayment_2023)

  // This is the upcoming indexation amount under the old CPI scheme

  $: old_debt_2024 = (starting_debt - old_repayment_2023) * (1 + cpi_index_2024)

  // Actual 4.7% amount under CPI in 2024
  $: cpi_indexation_2024 = (starting_debt - old_repayment_2023) * cpi_index_2024

  // new 2023 debt under WPI indexation scheme 
  $: new_debt_2023 = old_debt_2023_pre * (1 + wpi_index_2023)
  
  // Actual 2023 amount added with WPI of 3.2%

  $: wpi_indexation_2023 = old_debt_2023_pre * wpi_index_2023

  // this is actually the same as old_repayment since it's pre-indexation

  $: new_repayment_2023 = old_debt_2023_pre * repayment_rate

  // This is the upcoming indexation amount under the new WPI scheme

  $: new_debt_2024 = (new_debt_2023 - new_repayment_2023) * (1 + wpi_index_2024)

  // Actual 2024 amount added with WPI of 4%

  $: wpi_indexation_2024 = (new_debt_2023 - new_repayment_2023) * wpi_index_2024

  // Credits etc

  $: credit_2023 = cpi_indexation_2023 - wpi_indexation_2023
  $: credit_2024 = cpi_indexation_2024 - wpi_indexation_2024
  $: credit_total = credit_2023 + credit_2024

</script>


<div class="atom interactive-wrapper-outer hecsCalc">
  <div id="outer-wrapper" class="showcase">
    <div class="row">

    <div class='figureTitle' id="chartTitle" role="heading" aria-level="2">Help/Hecs changes credit calculator</div>
    <div class='subTitle' id="subTitle" role="heading" aria-level="3">This shows an estimate of how the government's changes to Hecs/Help indextion may affect you, based on preliminary figures. The debt amount required is the amount at 1 June 2023, which is your debt <i>after</i> the indexation of 7.1% was applied</div>
    <div class='notes' id='chartKey'>
      <div  class="controlBlock">
        <div class="input">
        Your debt as at 1 June 2023*:  <input type="number" min="5000" max="200000" step="5000" bind:value={starting_debt}>
        </div>
        <div class="input">
        Your 2022-23 taxable income**:  <input type="number" min="5000" max="200000" step="5000" bind:value={income}>
        </div>
      </div>
      <!-- <div  class="controlBlock">
        Starting pre-tax hourly rate: <input type="number" min="15.00" max="60.00" step="1" bind:value={starting_hourly_rate} on:change={updateSalary} >
      </div> -->

    </div>
    
    </div>
    <div class="row borderBottom" id="calcContainer">
      <div class="resultsCredit">
        <div class="resultsInner">
        Your estimated indexation credit for 2023 and 2024 is <span class="green">${Math.round(credit_total).toLocaleString()}</span>, which includes a credit of <span class="green">${Math.round(credit_2024).toLocaleString()}</span> from 2024, and a credit of <span class="green">${Math.round(credit_2023).toLocaleString()}</span> from 2023
        </div>
      </div>
      <table class="resultsTable">
        <tr>
          <th>Year</th>
          <th>Old indexation</th>
          <th>New indexation</th>
          <th>Credit</th>
        </tr>
        <tr>
          <td>2023</td>
          <td>${Math.round(cpi_indexation_2023).toLocaleString()}</td>
          <td>${Math.round(wpi_indexation_2023).toLocaleString()}</td>
          <td>${Math.round(credit_2023).toLocaleString()}</td>
        </tr>
        <tr>
          <td>2024</td>
          <td>${Math.round(cpi_indexation_2024).toLocaleString()}</td>
          <td>${Math.round(wpi_indexation_2024).toLocaleString()}</td>
          <td>${Math.round(credit_2024).toLocaleString()}</td>
        </tr>
      </table>
    </div>
    <div class='footer offset'>
      <div id="footerAnnotations">

      </div>	
      
      <span id="footnote"></span> Guardian graphic <span id="sourceText"> | *This is your Hecs/Help debt as at 1 June 2023, ie the amount from last year that had the indexation of 7.1% added to it. This amount will be available in your MyGov Help statements, as the balance on 1 June 2023. **This is your taxable income for the 2022-23 financial year, ie whatever you put in your last tax return. This calculator assumes the indexation rate based on the wage price index will be 4% for 2023-24, as per <a href="https://www.education.gov.au/helpestimator">this government calculator</a></span>
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

  .resultsCredit {
    font-size: 24px;
    // padding: 10px;
    margin-bottom: 20px;
    line-height: 1.2em;
    // border: 2px solid black;
    font-family: "Guardian Headline Full", Georgia, serif;
  }

  .green {
    font-weight: bold;
    color:#4a7801;
  }

  .input {
    margin-bottom: 10px;
  }

  .atom {
    background-color: white;
  }

  .resultsTable {
    text-align: center;
    width: 100%;
    font-size: 16px;
    line-height: 20px;
    color: #333333;
    font-family: "Guardian Egyptian Web", Georgia, serif;
    margin-bottom: 15px;

    th {
      font-weight: bold;
    }
  }

  .hecsCalc {
    max-width: 620px;
  }
</style>


