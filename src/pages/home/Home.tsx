import {
  UserGroupIcon,
  CalendarIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  BellAlertIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";

function Home() {
  const metrics = [
    {
      id: 1,
      label: "Patients",
      value: "2,456",
      icon: UserGroupIcon,
      color: "from-cyan-400 to-blue-500",
    },
    {
      id: 2,
      label: "Appointments",
      value: "24",
      icon: CalendarIcon,
      color: "from-emerald-400 to-teal-500",
    },
    {
      id: 3,
      label: "Pharmacy",
      value: "18",
      icon: ShoppingCartIcon,
      color: "from-orange-400 to-red-500",
    },
    {
      id: 4,
      label: "Reports",
      value: "12",
      icon: DocumentTextIcon,
      color: "from-violet-400 to-purple-500",
    },
  ];

  const actions = [
    {
      label: "New Appointment",
      href: "/appointments",
      icon: CalendarIcon,
    },
    {
      label: "Register Patient",
      href: "/patients",
      icon: UserGroupIcon,
    },
    {
      label: "Medical Records",
      href: "/medical-records",
      icon: DocumentTextIcon,
    },
    {
      label: "Pharmacy",
      href: "/pharmacy",
      icon: ShoppingCartIcon,
    },
  ];

  const alerts = [
    {
      id: 1,
      message: "3 pending lab reports need review",
      severity: "warning",
      time: "10 min ago",
    },
    {
      id: 2,
      message: "Dr. Johnson has 5 appointments today",
      severity: "info",
      time: "25 min ago",
    },
    {
      id: 3,
      message: "2 critical patient alerts",
      severity: "error",
      time: "1 hour ago",
    },
  ];

  return (
    <BaseLayout resourceName="Home">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back to your healthcare system
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="group relative bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div
                className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${metric.color} opacity-5 rounded-full group-hover:opacity-10 transition-opacity`}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} text-white`}
                  >
                    <metric.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-400 mt-3">
                  +2.5% from last week
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Alerts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quick Start
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all duration-300"
                  >
                    <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-blue-100 mb-3">
                      <action.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center">
                      {action.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">156</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Active Users Online
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">19/24</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Appointments Done
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">8</div>
                  <p className="text-sm text-gray-600 mt-2">New Admissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BellAlertIcon className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Alerts</h3>
              </div>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "error"
                        ? "bg-red-50 border-l-red-500"
                        : alert.severity === "warning"
                          ? "bg-yellow-50 border-l-yellow-500"
                          : "bg-blue-50 border-l-blue-500"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        alert.severity === "error"
                          ? "text-red-900"
                          : alert.severity === "warning"
                            ? "text-yellow-900"
                            : "text-blue-900"
                      }`}
                    >
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View All <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Server
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Operational - 99.9% uptime
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Database
                </span>
              </div>
              <p className="text-xs text-gray-500">Response time: 45ms</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Network
                </span>
              </div>
              <p className="text-xs text-gray-500">Health: 92% - Stable</p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Home;
