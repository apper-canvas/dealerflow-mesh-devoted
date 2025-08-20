import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import StatCard from "@/components/molecules/StatCard";
import ApperIcon from "@/components/ApperIcon";
import Chart from "react-apexcharts";
import { vehicleService } from "@/services/api/vehicleService";
import { leadService } from "@/services/api/leadService";
import { dealService } from "@/services/api/dealService";
const Reports = () => {
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vehiclesData, leadsData, dealsData] = await Promise.all([
        vehicleService.getAll(),
        leadService.getAll(),
        dealService.getAll()
      ]);
      setVehicles(vehiclesData);
      setLeads(leadsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load reports data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

// Calculate key metrics
  const totalInventoryValue = vehicles.reduce((sum, v) => sum + (v.askingPrice || 0), 0);
  const averageDaysInStock = vehicles.length > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + v.daysInInventory, 0) / vehicles.length)
    : 0;
  const totalSales = deals.filter(d => d.status === "Completed").reduce((sum, d) => sum + d.salePrice, 0);
  const totalMargin = deals.filter(d => d.status === "Completed").reduce((sum, d) => sum + d.margin, 0);
  const conversionRate = leads.length > 0 ? ((deals.length / leads.length) * 100).toFixed(1) : 0;
  
  // Floorplan Interest Analysis
  const floorplanRate = 0.08; // 8% annual rate
  const totalFloorplanInterest = vehicles.reduce((sum, v) => {
    const dailyRate = floorplanRate / 365;
    const interestCost = (v.cost || v.askingPrice * 0.8) * dailyRate * v.daysInInventory;
    return sum + interestCost;
  }, 0);
  
  const averageFloorplanCost = vehicles.length > 0 ? totalFloorplanInterest / vehicles.length : 0;
  
  // Enhanced margin analysis with floorplan costs
  const marginAnalysis = deals
    .filter(d => d.status === "Completed")
    .map(deal => {
      const vehicle = vehicles.find(v => v.Id === deal.vehicleId);
      const floorplanCost = vehicle 
        ? (vehicle.cost || deal.salePrice * 0.8) * (floorplanRate / 365) * vehicle.daysInInventory
        : 0;
      return {
        ...deal,
        floorplanCost,
        netMargin: deal.margin - floorplanCost
      };
    });
  
  const totalNetMargin = marginAnalysis.reduce((sum, d) => sum + d.netMargin, 0);
  
  // Inventory aging analysis
  const agingBuckets = {
    "0-30 days": vehicles.filter(v => v.daysInInventory <= 30).length,
    "31-60 days": vehicles.filter(v => v.daysInInventory > 30 && v.daysInInventory <= 60).length,
    "61-90 days": vehicles.filter(v => v.daysInInventory > 60 && v.daysInInventory <= 90).length,
    "90+ days": vehicles.filter(v => v.daysInInventory > 90).length
  };

  // Top performing vehicles by net margin
  const topVehiclesByMargin = marginAnalysis
    .sort((a, b) => b.netMargin - a.netMargin)
    .slice(0, 5);

  // Lead source analysis
  const leadsBySource = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  // Monthly performance with floorplan costs
  const monthlyData = [
    { month: "Jan", sales: 12, margin: 48000, floorplan: 3200, netMargin: 44800 },
    { month: "Feb", sales: 15, margin: 62000, floorplan: 4100, netMargin: 57900 },
    { month: "Mar", sales: 18, margin: 71000, floorplan: 4800, netMargin: 66200 },
    { month: "Apr", sales: 22, margin: 89000, floorplan: 5900, netMargin: 83100 },
    { month: "May", sales: 19, margin: 76000, floorplan: 5200, netMargin: 70800 },
    { month: "Jun", sales: 25, margin: 98000, floorplan: 6800, netMargin: 91200 }
  ];

  // Chart configurations
  const waterfallChartOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        colors: {
          ranges: [
            { from: -10000000, to: 0, color: '#ef4444' },
            { from: 0, to: 10000000, color: '#22c55e' }
          ]
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `$${(val/1000).toFixed(0)}K`
    },
    xaxis: {
      categories: ['Gross Margin', 'Floorplan Cost', 'Reconditioning', 'Other Costs', 'Net Margin']
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${(val/1000).toFixed(0)}K`
      }
    },
    colors: ['#22c55e', '#ef4444', '#f59e0b', '#6b7280', '#3b82f6']
  };

  const waterfallData = [{
    name: 'Margin Analysis',
    data: [
      totalMargin,
      -totalFloorplanInterest,
      -15000, // Reconditioning costs
      -8000,  // Other costs
      totalNetMargin
    ]
  }];

  const trendChartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: monthlyData.map(d => d.month)
    },
    yaxis: [
      {
        title: { text: 'Margin ($)' },
        labels: {
          formatter: (val) => `$${(val/1000).toFixed(0)}K`
        }
      }
    ],
    colors: ['#3b82f6', '#22c55e', '#ef4444'],
    legend: {
      position: 'top'
    }
  };

  const trendData = [
    {
      name: 'Gross Margin',
      data: monthlyData.map(d => d.margin)
    },
    {
      name: 'Net Margin',
      data: monthlyData.map(d => d.netMargin)
    },
    {
      name: 'Floorplan Cost',
      data: monthlyData.map(d => -d.floorplan)
    }
  ];

  return (
<div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Inventory Value"
          value={`$${(totalInventoryValue / 1000).toFixed(0)}K`}
          icon="DollarSign"
          trend="up"
          trendValue="+12.5%"
          color="success"
        />
        <StatCard
          title="Avg. Days in Stock"
          value={averageDaysInStock}
          icon="Calendar"
          trend="down"
          trendValue="-8.2%"
          color="primary"
        />
        <StatCard
          title="Total Floorplan Cost"
          value={`$${(totalFloorplanInterest / 1000).toFixed(0)}K`}
          icon="CreditCard"
          trend="down"
          trendValue="-5.1%"
          color="warning"
        />
        <StatCard
          title="Net Margin YTD"
          value={`$${(totalNetMargin / 1000).toFixed(0)}K`}
          icon="TrendingUp"
          trend="up"
          trendValue="+18.3%"
          color="success"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon="Target"
          trend="up"
          trendValue="+3.4%"
          color="slate"
        />
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Waterfall Analysis */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Margin Waterfall Analysis</h3>
            <ApperIcon name="BarChart4" className="h-5 w-5 text-slate-500" />
          </div>
          <div className="h-80">
            <Chart
              options={waterfallChartOptions}
              series={waterfallData}
              type="bar"
              height="100%"
            />
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Gross Margin:</span>
                <span className="ml-2 font-semibold text-green-600">
                  ${(totalMargin / 1000).toFixed(0)}K
                </span>
              </div>
              <div>
                <span className="text-slate-600">Floorplan Cost:</span>
                <span className="ml-2 font-semibold text-red-600">
                  -${(totalFloorplanInterest / 1000).toFixed(0)}K
                </span>
              </div>
              <div>
                <span className="text-slate-600">Net Margin:</span>
                <span className="ml-2 font-semibold text-blue-600">
                  ${(totalNetMargin / 1000).toFixed(0)}K
                </span>
              </div>
              <div>
                <span className="text-slate-600">Margin Rate:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {totalSales > 0 ? ((totalNetMargin / totalSales) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Trend Lines */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Performance Trends</h3>
            <ApperIcon name="TrendingUp" className="h-5 w-5 text-slate-500" />
          </div>
          <div className="h-80">
            <Chart
              options={trendChartOptions}
              series={trendData}
              type="line"
              height="100%"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Gross Margin Trend</p>
              <p className="text-lg font-bold text-blue-700">+23.4%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Net Margin Trend</p>
              <p className="text-lg font-bold text-green-700">+19.8%</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 font-medium">Floorplan Impact</p>
              <p className="text-lg font-bold text-red-700">-3.6%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floorplan Interest Breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Floorplan Interest Analysis</h3>
            <ApperIcon name="Calculator" className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-amber-800">Average Daily Rate</span>
                <span className="text-lg font-bold text-amber-900">
                  {((floorplanRate / 365) * 100).toFixed(4)}%
                </span>
              </div>
              <p className="text-xs text-amber-700">Based on {(floorplanRate * 100).toFixed(1)}% annual rate</p>
            </div>
            
            <div className="space-y-3">
              {Object.entries(agingBuckets).map(([range, count]) => {
                const avgDays = range === "0-30 days" ? 15 : 
                               range === "31-60 days" ? 45 :
                               range === "61-90 days" ? 75 : 120;
                const avgValue = totalInventoryValue / vehicles.length;
                const interestCost = count * avgValue * 0.8 * (floorplanRate / 365) * avgDays;
                
                return (
                  <div key={range} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{range}</p>
                      <p className="text-xs text-slate-500">{count} vehicles</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        ${(interestCost / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-slate-500">interest cost</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Top Performing Deals by Net Margin */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Top Net Margin Performers</h3>
            <ApperIcon name="Award" className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-3">
            {topVehiclesByMargin.map((deal, index) => {
              const vehicle = vehicles.find(v => v.Id === deal.vehicleId);
              return (
                <div key={deal.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-orange-500 text-white" :
                      "bg-slate-300 text-slate-700"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}
                      </p>
                      <p className="text-xs text-slate-500">{deal.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      ${deal.netMargin.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      net margin (-${deal.floorplanCost.toFixed(0)} floorplan)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Aging */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Inventory Aging Analysis</h3>
            <ApperIcon name="Clock" className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-4">
            {Object.entries(agingBuckets).map(([range, count]) => {
              const percentage = vehicles.length > 0 ? (count / vehicles.length) * 100 : 0;
              const color = range === "90+ days" ? "bg-red-500" : 
                           range === "61-90 days" ? "bg-amber-500" :
                           range === "31-60 days" ? "bg-blue-500" : "bg-green-500";
              
              return (
                <div key={range}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">{range}</span>
                    <span className="text-sm text-slate-600">{count} vehicles</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Lead Sources */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Lead Sources</h3>
            <ApperIcon name="Users" className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-3">
            {Object.entries(leadsBySource)
              .sort(([,a], [,b]) => b - a)
              .map(([source, count]) => {
                const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                
                return (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded">
                        <ApperIcon 
                          name={source === "Website" ? "Globe" : 
                                source === "Phone Inquiry" ? "Phone" :
                                source === "Social Media" ? "Share2" :
                                source === "Referral" ? "UserCheck" : "Users"} 
                          className="h-4 w-4 text-primary-600" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{source}</p>
                        <p className="text-xs text-slate-500">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{count}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-full w-fit">
              <ApperIcon name="TrendingUp" className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Sales Growth</h4>
            <p className="text-3xl font-bold text-green-600 mt-2">+24.5%</p>
            <p className="text-sm text-slate-500">vs. last quarter</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-fit">
              <ApperIcon name="Users" className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Customer Satisfaction</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">4.8/5</p>
            <p className="text-sm text-slate-500">average rating</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-fit">
              <ApperIcon name="Clock" className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Avg. Sale Cycle</h4>
            <p className="text-3xl font-bold text-purple-600 mt-2">12.5</p>
            <p className="text-sm text-slate-500">days to close</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;