import { Component, OnInit } from '@angular/core';
import {EthereumAnalysisService} from "../../services/ethereum-analysis.service";

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {

   private topRevenueSent = [];
   private topRevenueReceived = [];
   private topGasRevenue = [];

  constructor(private eas: EthereumAnalysisService) { }

  ngOnInit() {
      this.getTopRevenue();
  }

  private getTopRevenue(){
      this.eas.getTopRevenueSent(3).subscribe((result) => {
          this.topRevenueSent = this.prepareResult(result);
      })
      this.eas.getTopRevenueReceived(3).subscribe((result) => {
          this.topRevenueReceived = this.prepareResult(result);
      })
      this.eas.getTopGasRevenue(3).subscribe((result) => {
          this.topGasRevenue = this.prepareResult(result);
      })
  }

  private prepareResult(result){
    let res = result.json();
    for (var i = 0; i < res.length; ++i) {
      res[i].rank = i+1
      res[i].value = parseFloat(res[i].value).toFixed(7)
    }
    return res;
  }

}
