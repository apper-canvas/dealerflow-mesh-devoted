import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import ApperIcon from '@/components/ApperIcon';
import { listingService } from '@/services/api/listingService';
import { toast } from 'react-toastify';

export default function ListingManager({ vehicle, onClose, onUpdate }) {
  const [loading, setLoading] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [vehicle.Id]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await listingService.getListingAnalytics(vehicle.Id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handlePublish = async (platform) => {
    setLoading(prev => ({ ...prev, [platform]: true }));
    try {
      let result;
      if (platform === 'carscom') {
        result = await listingService.publishToCarscom(vehicle.Id);
      } else if (platform === 'autotrader') {
        result = await listingService.publishToAutoTrader(vehicle.Id);
      }

      if (result.success) {
        toast.success(`Successfully published to ${platform === 'carscom' ? 'Cars.com' : 'AutoTrader'}`);
        onUpdate();
        loadAnalytics();
      }
    } catch (error) {
      toast.error(`Failed to publish to ${platform === 'carscom' ? 'Cars.com' : 'AutoTrader'}: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleRemove = async (platform) => {
    if (!window.confirm(`Are you sure you want to remove this listing from ${platform === 'carscom' ? 'Cars.com' : 'AutoTrader'}?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [platform]: true }));
    try {
      let result;
      if (platform === 'carscom') {
        result = await listingService.removeFromCarscom(vehicle.Id);
      } else if (platform === 'autotrader') {
        result = await listingService.removeFromAutoTrader(vehicle.Id);
      }

      if (result.success) {
        toast.success(`Successfully removed from ${platform === 'carscom' ? 'Cars.com' : 'AutoTrader'}`);
        onUpdate();
        loadAnalytics();
      }
    } catch (error) {
      toast.error(`Failed to remove from ${platform === 'carscom' ? 'Cars.com' : 'AutoTrader'}: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handlePublishAll = async () => {
    setLoading({ carscom: true, autotrader: true });
    try {
      const results = await listingService.publishToAll(vehicle.Id);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`Published to ${successCount} platform${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to publish to ${failCount} platform${failCount > 1 ? 's' : ''}`);
      }
      
      onUpdate();
      loadAnalytics();
    } catch (error) {
      toast.error('Failed to publish listings');
    } finally {
      setLoading({});
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Live';
      case 'pending': return 'Publishing...';
      case 'failed': return 'Failed';
      default: return 'Not Published';
    }
  };

  const isPublished = (platform) => {
    return vehicle.publications?.[platform]?.status === 'published';
  };

  const isPending = (platform) => {
    return vehicle.publications?.[platform]?.status === 'pending';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Listing Management</h2>
            <p className="text-sm text-slate-500">
              {vehicle.year} {vehicle.make} {vehicle.model} - VIN: {vehicle.vin}
            </p>
          </div>
          <Button variant="secondary" onClick={onClose}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handlePublishAll}
                disabled={loading.carscom || loading.autotrader}
                className="flex-1"
              >
                {(loading.carscom || loading.autotrader) && <Loading />}
                <ApperIcon name="Upload" />
                Publish to All Platforms
              </Button>
            </div>
          </Card>

          {/* Cars.com Management */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Globe" className="text-blue-600" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Cars.com</h3>
                  <p className="text-sm text-slate-500">Automotive marketplace leader</p>
                </div>
              </div>
              <Badge variant={getStatusColor(vehicle.publications?.carscom?.status)}>
                {getStatusText(vehicle.publications?.carscom?.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {analyticsLoading ? (
                <div className="col-span-2 text-center py-4">
                  <Loading />
                </div>
              ) : analytics.carscom ? (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{analytics.carscom.views || 0}</p>
                    <p className="text-sm text-slate-500">Total Views</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{analytics.carscom.leads || 0}</p>
                    <p className="text-sm text-slate-500">Generated Leads</p>
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-center py-4 text-slate-500">
                  No analytics available
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isPublished('carscom') ? (
                <Button
                  variant="primary"
                  onClick={() => handlePublish('carscom')}
                  disabled={loading.carscom || isPending('carscom')}
                  className="flex-1"
                >
                  {loading.carscom && <Loading />}
                  <ApperIcon name="Upload" />
                  Publish to Cars.com
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemove('carscom')}
                    disabled={loading.carscom}
                    className="flex-1"
                  >
                    {loading.carscom && <Loading />}
                    <ApperIcon name="Trash2" />
                    Remove Listing
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(`https://cars.com/vehicledetail/${vehicle.vin}`, '_blank')}
                  >
                    <ApperIcon name="ExternalLink" />
                    View Live Listing
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* AutoTrader Management */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Car" className="text-orange-600" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">AutoTrader</h3>
                  <p className="text-sm text-slate-500">Premier automotive marketplace</p>
                </div>
              </div>
              <Badge variant={getStatusColor(vehicle.publications?.autotrader?.status)}>
                {getStatusText(vehicle.publications?.autotrader?.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {analyticsLoading ? (
                <div className="col-span-3 text-center py-4">
                  <Loading />
                </div>
              ) : analytics.autotrader ? (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{analytics.autotrader.impressions || 0}</p>
                    <p className="text-sm text-slate-500">Impressions</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{analytics.autotrader.clicks || 0}</p>
                    <p className="text-sm text-slate-500">Clicks</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{analytics.autotrader.leads || 0}</p>
                    <p className="text-sm text-slate-500">Leads</p>
                  </div>
                </>
              ) : (
                <div className="col-span-3 text-center py-4 text-slate-500">
                  No analytics available
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isPublished('autotrader') ? (
                <Button
                  variant="primary"
                  onClick={() => handlePublish('autotrader')}
                  disabled={loading.autotrader || isPending('autotrader')}
                  className="flex-1"
                >
                  {loading.autotrader && <Loading />}
                  <ApperIcon name="Upload" />
                  Publish to AutoTrader
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemove('autotrader')}
                    disabled={loading.autotrader}
                    className="flex-1"
                  >
                    {loading.autotrader && <Loading />}
                    <ApperIcon name="Trash2" />
                    Remove Listing
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(`https://autotrader.com/cars-for-sale/vehicledetails/${vehicle.vin}`, '_blank')}
                  >
                    <ApperIcon name="ExternalLink" />
                    View Live Listing
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Listing Information */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Listing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">Vehicle Details</p>
                <p className="text-slate-600">VIN: {vehicle.vin}</p>
                <p className="text-slate-600">Price: ${vehicle.askingPrice?.toLocaleString()}</p>
                <p className="text-slate-600">Mileage: {vehicle.mileage?.toLocaleString()} miles</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Listing Status</p>
                <p className="text-slate-600">Vehicle Status: {vehicle.status}</p>
                <p className="text-slate-600">Condition: {vehicle.condition}</p>
                <p className="text-slate-600">Location: {vehicle.location}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}