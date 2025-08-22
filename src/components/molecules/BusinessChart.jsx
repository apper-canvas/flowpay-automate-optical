import { useState } from "react"
import { motion } from "framer-motion"
import Chart from "react-apexcharts"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"

const BusinessChart = ({ revenueData, loading = false }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily")

  const periods = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" }
  ]

  const getChartData = () => {
    if (!revenueData || !revenueData[selectedPeriod]) return { categories: [], data: [] }
    
    const data = revenueData[selectedPeriod]
    return {
      categories: data.map(item => item.date || item.period),
      data: data.map(item => item.revenue)
    }
  }

  const chartData = getChartData()

  const chartOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#5B3FFF'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6B7280'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6B7280'
        },
        formatter: (value) => {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
        }
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const value = series[seriesIndex][dataPointIndex]
        const category = w.globals.labels[dataPointIndex]
        return `
          <div class="bg-white p-3 rounded-lg shadow-lg border">
            <div class="font-medium text-gray-900">${category}</div>
            <div class="text-primary font-semibold">
              ${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(value)}
            </div>
          </div>
        `
      }
    }
  }

  if (loading) {
    return (
      <Card padding="default">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card padding="default">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Revenue Analytics
            </h3>
            
            <div className="flex space-x-1">
              {periods.map((period) => (
                <Button
                  key={period.key}
                  size="sm"
                  variant={selectedPeriod === period.key ? "primary" : "ghost"}
                  onClick={() => setSelectedPeriod(period.key)}
                  className="text-xs"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <Chart
              options={chartOptions}
              series={[{
                name: 'Revenue',
                data: chartData.data
              }]}
              type="area"
              height={250}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default BusinessChart