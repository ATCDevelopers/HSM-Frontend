import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import Dropdown from "../../components/atoms/ui/Dropdown";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import Table from "../../components/sections/Table";
import { patientAPI, type Patient } from "../../services/patientAPI";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import Swal from "sweetalert2";

export default function PatientManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreate = can('create', 'Patient', user?.role) || can('manage', 'Patient', user?.role);
  const canUpdate = can('update', 'Patient', user?.role) || can('manage', 'Patient', user?.role);
  const canDelete = can('delete', 'Patient', user?.role) || can('manage', 'Patient', user?.role);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    patientAPI.list()
      .then(setPatients)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  const totalPatients = patients.length;
  const activePatients = patients.filter((patient) => (patient.status ? patient.status.toUpperCase() === "ACTIVE" : true)).length;
  const inactivePatients = patients.filter((patient) => patient.status && (patient.status.toUpperCase() === "DEACTIVE" || patient.status.toUpperCase() === "INACTIVE")).length;

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.trim().toLowerCase();
    const phone = patient.phoneNumber || patient.phone || "";
    return !search || [patient.id, patient.firstName, patient.middleName || "", patient.lastName, phone, patient.email].some((value) => value.toLowerCase().includes(search));
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = filteredPatients.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const deletePatient = async (patient: Patient) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${patient.firstName} ${patient.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;

    try {
      await patientAPI.remove(patient.id);
      setPatients((current) => current.filter((item) => item.id !== patient.id));
      await Swal.fire({
        title: "Deleted!",
        text: "Patient record has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "Failed to delete patient";
      setError(msg);
      Swal.fire("Error!", msg, "error");
    }
  };

  interface DropdownItem {
    label: string;
    onClick: () => void;
    className?: string;
  }

  const getPatientActions = (patient: Patient): DropdownItem[] => {
    const actions: DropdownItem[] = [{ label: "View", onClick: () => navigate(`/patients/${patient.id}`) }];
    if (canUpdate) {
      actions.push({ label: "Edit", onClick: () => navigate(`/patients/${patient.id}/edit`) });
    }
    if (canDelete) {
      actions.push({ label: "Delete", onClick: () => deletePatient(patient), className: "text-red-600 hover:bg-red-50" });
    }
    return actions;
  };

  const columns = [
    {
      key: "name",
      title: "Patient",
      render: (_: any, p: Patient) => (
        <span className="font-semibold text-gray-900">
          {p.firstName} {p.middleName ? `${p.middleName} ` : ""}{p.lastName}
        </span>
      ),
    },
    {
      key: "id",
      title: "Patient ID",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "gender",
      title: "Gender",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "dateOfBirth",
      title: "Date of birth",
      render: (val: string) => (
        <span className="text-gray-700">
          {val ? new Date(val).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (_: any, p: Patient) => (
        <span className="text-gray-700">{p.phoneNumber || p.phone || "N/A"}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (val: string) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${(val || "ACTIVE") === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {val || "ACTIVE"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, p: Patient) => (
        <Dropdown
          children={null}
          items={getPatientActions(p)}
          trigger={<EllipsisVerticalIcon className="h-5 w-5" />}
          showChevron={false}
          triggerAriaLabel="Patient actions"
          position="bottom-right"
          triggerClassName="border-0 px-2 py-1 text-gray-500 hover:bg-gray-100"
        />
      ),
    },
  ];

  return (
    <BaseLayout resourceName="Patients">
      <div className="w-full rounded-2xl bg-blue-50 p-3.5 sm:p-6 min-h-[calc(100vh-6rem)] flex flex-col justify-between">
        <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col">
          {/* Top Toolbar Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-5">
            <div className="shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Patient Management</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-gray-500">Manage patient registration, records and information.</p>
            </div>

            {/* Fluid Centered Search Field */}
            <div className="w-full sm:flex-1 sm:max-w-md sm:mx-auto">
              <Input
                label=""
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search patient name, ID or phone..."
                className="w-full"
              />
            </div>

            {/* Action Button */}
            <div className="shrink-0">
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/patients/register")}
                  className="w-full sm:w-auto justify-center"
                >
                  Add Patient
                </Button>
              )}
            </div>
          </div>

          {/* Top Summary Cards (Static) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            {/* Total Patients */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Patients</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-900">{loading ? "..." : totalPatients}</h3>
                <p className="mt-0.5 text-xs text-gray-500">Registered patient records</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
            </div>

            {/* Active Patients */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Patients</p>
                <h3 className="mt-1 text-2xl font-bold text-green-600">{loading ? "..." : activePatients}</h3>
                <p className="mt-0.5 text-xs text-gray-500">Active medical profiles</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
            </div>

            {/* Inactive Patients */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inactive Patients</p>
                <h3 className="mt-1 text-2xl font-bold text-red-600">{loading ? "..." : inactivePatients}</h3>
                <p className="mt-0.5 text-xs text-gray-500">Deactivated patient records</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircleIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {/* Main Content Area */}
          <div className="w-full flex-1 flex flex-col justify-between">
            <Table
              columns={columns}
              data={paginatedPatients}
              loading={loading}
              emptyMessage="No patients found."
            />

            {/* Static Bottom Pagination Controls */}
            {!loading && (
              <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl border shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-3">
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{filteredPatients.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, filteredPatients.length)}</span> of <span className="font-medium">{filteredPatients.length}</span> patients
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </BaseLayout>
  );
}
