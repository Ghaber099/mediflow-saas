const salesChartCanvas = document.getElementById("salesChart");

if (salesChartCanvas) {
  new Chart(salesChartCanvas, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Sales Revenue",
          data: [1200, 1900, 1500, 2400, 2200, 3100, 2800],
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "#101828",
          padding: 12,
          cornerRadius: 12
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "#eef2f6"
          },
          ticks: {
            callback: function(value) {
              return "$" + value;
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}