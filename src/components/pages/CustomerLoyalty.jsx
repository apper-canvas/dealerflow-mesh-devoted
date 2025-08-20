import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { dealService } from "@/services/api/dealService";
import { toast } from "react-toastify";

const CustomerLoyalty = () => {
  const [loyaltyData, setLoyaltyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLoyaltyData = async () => {
    setLoading(true);
    setError("");
    try {
      const deals = await dealService.getAll();
      const uniqueCustomers = [...new Set(deals.map(d => d.customerId))];
      
      const loyaltyPromises = uniqueCustomers.map(async (customerId) => {
        const customerDeals = deals.filter(d => d.customerId === customerId);
        const loyalty = await dealService.calculateCustomerLoyalty(customerId, customerDeals);
        return {
          ...loyalty,
          customerName: customerDeals[0]?.customerName || `Customer #${customerId}`
        };
      });
      
      const results = await Promise.all(loyaltyPromises);
      setLoyaltyData(results.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints));
    } catch (err) {
      setError("Failed to load loyalty data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLoyaltyData} />;

  const getTierColor = (tier) => {
    switch (tier) {
      case "Gold": return "warning";
      case "Silver": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Loyalty Program</h1>
          <p className="text-slate-600">Manage customer loyalty tiers and rewards</p>
        </div>
        <Button variant="primary">
          <ApperIcon name="Award" />
          Export Loyalty Report
        </Button>
      </div>

      {/* Loyalty Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ApperIcon name="Crown" className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Gold Members</p>
              <p className="text-2xl font-bold text-slate-900">
                {loyaltyData.filter(c => c.tier === "Gold").length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ApperIcon name="Medal" className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Silver Members</p>
              <p className="text-2xl font-bold text-slate-900">
                {loyaltyData.filter(c => c.tier === "Silver").length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-800 bg-opacity-10 rounded-lg">
              <ApperIcon name="Award" className="h-6 w-6 text-amber-800" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bronze Members</p>
              <p className="text-2xl font-bold text-slate-900">
                {loyaltyData.filter(c => c.tier === "Bronze").length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Points</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(loyaltyData.reduce((sum, c) => sum + c.loyaltyPoints, 0) / loyaltyData.length) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Loyalty List */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">All Customers</h3>
        <div className="space-y-4">
          {loyaltyData.map((customer) => (
            <div key={customer.customerId} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {customer.customerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{customer.customerName}</h4>
                  <p className="text-sm text-slate-500">{customer.dealCount} purchases • Last: {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Total Spent</p>
                  <p className="font-semibold text-slate-900">${customer.totalSpent.toLocaleString()}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-slate-500">Points</p>
                  <p className="font-semibold text-primary-600">{customer.loyaltyPoints.toLocaleString()}</p>
                </div>
                
                <Badge variant={getTierColor(customer.tier)}>
                  {customer.tier}
                </Badge>
                
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CustomerLoyalty;