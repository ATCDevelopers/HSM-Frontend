import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Dropdown from "../../components/atoms/ui/Dropdown";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import { userAPI, type User } from "../../services/userAPI";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import Swal from "sweetalert2";

import Table from "../../components/sections/Table";

export default function UsersIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreate = can('create', 'User', user?.role) || can('manage', 'User', user?.role);
  const canUpdate = can('update', 'User', user?.role) || can('manage', 'User', user?.role);
  const canDelete = can('delete', 'User', user?.role) || can('manage', 'User', user?.role);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    userAPI.list()
      .then(setUsers)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const totalCount = users.length;
  const activeCount = users.filter((u) => (u.status ? u.status.toUpperCase() === "ACTIVE" : !u.isDeleted)).length;
  const inactiveCount = users.filter((u) => (u.status ? u.status.toUpperCase() === "INACTIVE" || u.status.toUpperCase() === "DEACTIVE" : !!u.isDeleted)).length;

  const filtered = users.filter((u) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return [u.id, u.firstName, u.secondName || "", u.lastName, u.email, u.role, u.status || (u.isDeleted ? "inactive" : "active")].some((v) => v.toLowerCase().includes(s));
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleDelete(u: User) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${u.firstName} ${u.lastName}?`,
      icon: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    
    userAPI.remove(u.id)
      .then(() => {
        setUsers((current) => current.filter((x) => x.id !== u.id));
        Swal.fire('Deleted!', 'The user has been deleted.', 'success');
      })
      .catch((requestError: unknown) => {
        const msg = requestError instanceof Error ? requestError.message : "Failed to delete user";
        setError(msg);
        Swal.fire('Error', msg, 'error');
      });
  }

  interface DropdownItem {
    label: string;
    onClick: () => void;
    className?: string;
  }

  const getUserActions = (u: User): DropdownItem[] => {
    const actions: DropdownItem[] = [{ label: 'View', onClick: () => navigate(`/users/${u.id}`) }];
    if (canUpdate) {
      actions.push({ label: 'Edit', onClick: () => navigate(`/users/${u.id}/edit`) });
    }
    if (canDelete) {
      actions.push({ label: 'Delete', onClick: () => handleDelete(u), className: 'text-red-600 hover:bg-red-50' });
    }
    return actions;
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (_: any, u: User) => (
        <span className="font-semibold text-gray-900">
          {u.firstName} {u.secondName ? `${u.secondName} ` : ""}{u.lastName}
        </span>
      ),
    },
    {
      key: "id",
      title: "User ID",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "email",
      title: "Email",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "role",
      title: "Role",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (_: any, u: User) => {
        const isActive = u.status === "ACTIVE" || (!u.status && !u.isDeleted);
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, u: User) => (
        <Dropdown
          children={null}
          showChevron={false}
          trigger={<EllipsisVerticalIcon className="h-5 w-5" />}
          triggerAriaLabel="User actions"
          items={getUserActions(u)}
          position="bottom-right"
        />
      ),
    },
  ];

  return (
    <BaseLayout resourceName="Users">
      <div className="w-full rounded-2xl bg-blue-50 p-3.5 sm:p-6 min-h-[calc(100vh-6rem)] flex flex-col justify-between">
        <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col">
          {/* Top Toolbar Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-5">
            <div className="shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Users</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-gray-500">Manage system users, roles and portals.</p>
            </div>

            {/* Fluid Centered Search Field */}
            <div className="w-full sm:flex-1 sm:max-w-md sm:mx-auto">
              <Input
                label=""
                type="search"
                placeholder="Search users by name, id, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Action Button */}
            <div className="shrink-0">
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/users/register')}
                  className="w-full sm:w-auto justify-center"
                >
                  Add user
                </Button>
              )}
            </div>
          </div>

          {/* Top Summary Cards (Static) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            {/* Total Users */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Users</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-900">{loading ? "..." : totalCount}</h3>
                <p className="mt-0.5 text-xs text-gray-500">System registered accounts</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
            </div>

            {/* Active Users */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Users</p>
                <h3 className="mt-1 text-2xl font-bold text-green-600">{loading ? "..." : activeCount}</h3>
                <p className="mt-0.5 text-xs text-gray-500">Authorized & active accounts</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
            </div>

            {/* Inactive Users */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inactive Users</p>
                <h3 className="mt-1 text-2xl font-bold text-red-600">{loading ? "..." : inactiveCount}</h3>
                <p className="mt-0.5 text-xs text-gray-500">Deactivated / suspended accounts</p>
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
              data={paginated}
              loading={loading}
              emptyMessage="No users found."
            />
            
            {/* Static Bottom Pagination Controls */}
            {!loading && (
              <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl border shadow-sm flex items-center justify-between mt-3">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{filtered.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
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
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
