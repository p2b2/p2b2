import {AfterContentInit, Component, ElementRef, OnChanges, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {FormControl, FormGroupDirective, NgForm} from "@angular/forms";
import {EthereumAnalysisService} from "../../services/ethereum-analysis.service";


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges {

  @ViewChild('chart') private chartContainer: ElementRef;
  // TODO: get the graph data from the service instead
  private graphData: any = {
    "nodes": [{name: "Peter", label: "External", id: 1}, {name: "Michael", label: "External", id: 2},
      {name: "Neo4j", label: "Contract", id: 3}],
    "links": [{source: 0, target: 1, type: "KNOWS", since: 2010}, {source: 0, target: 2, type: "FOUNDED"},
      {source: 1, target: 2, type: "WORKS_ON"}]
  };
  private chart: any;
  private width: number;
  private height: number;
  private margin: any = {top: 20, bottom: 20, left: 20, right: 20};
  private accountDegreeCentrality = [];

  constructor(private ethereumAnalysisService: EthereumAnalysisService) {
  }

  ngOnInit() {


  }

  private getCentrality(context:string) {
    d3.select("svg").remove();
    this.ethereumAnalysisService.getDegreeCentrality(context).subscribe((res) => {
      this.accountDegreeCentrality = res;
      let accounts = [];
      res.forEach((account, index) => {
        accounts.push(account.address);
      });
      this.ethereumAnalysisService.getGraphForAccounts(accounts).subscribe((result)=>{
        this.graphData = result;
        this.createChart();
      })
    });
  }

  ngOnChanges() {
    /*   if (this.chart) {
     // TODO: check out this example for re-scaling the graph: https://github.com/keathmilligan/angular2-d3-v4/blob/master/src/app/shared/barchart/barchart.component.ts
     this.updateChart();
     } */
  }


  createChart() {
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    // force layout setup
    let force = (<any> d3).layout.force()
      .charge(-150).linkDistance(40).size([this.width, this.height]);

    // setup svg div
    let svg = d3.select(element).append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("pointer-events", "all");

    force.nodes(this.graphData.nodes).links(this.graphData.links).start();

    // render relationships as lines
    let link = svg.selectAll(".link")
      .data(this.graphData.links).enter()
      .append("line").attr("class", "link");

    // render nodes as circles, css-class from label
    let node = svg.selectAll(".node")
      .data(this.graphData.nodes).enter()
      .append("circle")
      .attr("class", function (d) {
        return "node " + (<any> d).label
      })
      .attr("r", 8)
      .call(force.drag);

    // html title attribute for title node-attribute
    node.append("title")
      .text(function (d) {
        let title = (<any> d).properties.address || (<any> d).properties.blockNumber;
        return title;
      });

    // force feed algo ticks for coordinate computation
    force.on("tick", function () {
      link.attr("x1", function (d) {
        return (<any> d).source.x;
      })
        .attr("y1", function (d) {
          return (<any> d).source.y;
        })
        .attr("x2", function (d) {
          return (<any> d).target.x;
        })
        .attr("y2", function (d) {
          return (<any> d).target.y;
        });

      node.attr("cx", function (d) {
        return (<any> d).x;
      })
        .attr("cy", function (d) {
          return (<any> d).y;
        });
    });
  }

}
