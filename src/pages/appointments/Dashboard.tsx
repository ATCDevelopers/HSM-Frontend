import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Appointments Dashboard</h1>
      
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total Today</p>
          <p className="text-2xl font-bold text-gray-800">12</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">3</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">7</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">2</p>
        </div>
      </div>
    </div>
  );
};