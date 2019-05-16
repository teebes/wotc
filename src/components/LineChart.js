import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: ["chart_data", "foo"],
  mounted() {
    console.log(this.foo);
    console.log(this.chart_data);

    this.gradient = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);
    this.gradient2 = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);

    this.gradient.addColorStop(0, "rgba(255, 0,0, 0.5)");
    this.gradient.addColorStop(0.5, "rgba(255, 0, 0, 0.25)");
    this.gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

    this.gradient2.addColorStop(0, "rgba(0, 231, 255, 0.9)");
    this.gradient2.addColorStop(0.5, "rgba(0, 231, 255, 0.25)");
    this.gradient2.addColorStop(1, "rgba(0, 231, 255, 0)");

    this.chart_data.datasets[0] = {
      ...this.chart_data.datasets[0],
      ...{
        borderColor: "#FC2525",
        pointBackgroundColor: "white",
        borderWidth: 1,
        pointBorderColor: "white",
        backgroundColor: this.gradient
      }
    };
    this.chart_data.datasets[1] = {
      ...this.chart_data.datasets[1],
      ...{
        borderColor: "#05CBE1",
        pointBackgroundColor: "white",
        pointBorderColor: "white",
        borderWidth: 1,
        backgroundColor: this.gradient2
      }
    };

    console.log(this.chart_data);

    this.renderChart(this.chart_data, {
      responsive: true,
      maintainAspectRatio: false
    });

    /*
    this.renderChart({
      //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: '#FC2525',
          data: [40, 39, 10, 40, 39, 80, 40]
        },{
          label: 'Data Two',
          backgroundColor: '#05CBE1',
          data: [60, 55, 32, 10, 2, 12, 53]
        }
      ]
    }, {responsive: true, maintainAspectRatio: false})
    */
  }
};
