import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import { userAPI, type User } from "../../services/userAPI";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import Swal from "sweetalert2";

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const canCreate = can("create", "User", currentUser?.role) || can("manage", "User", currentUser?.role);
  const canUpdate = can("update", "User", currentUser?.role) || can("manage", "User", currentUser?.role);
  const canDelete = can("delete", "User", currentUser?.role) || can("manage", "User", currentUser?.role);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userAPI
      .get(id)
      .then(setUser)
      .catch((requestError: unknown) =>
        setError(requestError instanceof Error ? requestError.message : "User not found")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const deleteUser = async () => {
    if (!user) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${user.firstName} ${user.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;

    try {
      await userAPI.remove(user.id);
      await Swal.fire({
        title: "Deleted!",
        text: "User account has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/users");
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "Failed to delete user";
      setError(msg);
      Swal.fire("Error!", msg, "error");
    }
  };

  if (loading) {
    return (
      <BaseLayout resourceName="User Details">
        <div className="w-full rounded-2xl bg-blue-50 p-6 min-h-[calc(100vh-6rem)]">
          <div className="mx-auto max-w-4xl text-sm text-gray-600">
            Loading user details...
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (!user) {
    return (
      <BaseLayout resourceName="User Details">
        <div className="w-full rounded-2xl bg-blue-50 p-6 min-h-[calc(100vh-6rem)]">
          <div className="mx-auto max-w-4xl">
            <button
              onClick={() => navigate("/users")}
              className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Back to Users
            </button>
            <div className="rounded-2xl bg-white p-8 text-sm text-red-600 shadow-sm">
              {error || "User record not found."}
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const personalDetails: [string, string][] = [
    ["User ID", user.id],
    ["First Name", user.firstName],
    ["Second / Middle Name", user.secondName || "Not provided"],
    ["Last Name", user.lastName],
    ["Email Address", user.email],
    ["Phone Number", user.phoneNumber || "Not provided"],
  ];

  const systemDetails: [string, string][] = [
    ["System Role", user.role],
    ["Account Status", user.status || "ACTIVE"],
    ["Created Date", user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "System Record"],
  ];

  const avatarUrl = user.imagePath || user.photo;

  return (
    <BaseLayout resourceName="User Details">
      <div className="w-full rounded-2xl bg-blue-50 p-6 min-h-[calc(100vh-6rem)]">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            onClick={() => navigate("/users")}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Users
          </button>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            {/* Header / Avatar */}
            <div className="flex items-center gap-5 border-b border-gray-200 pb-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-20 w-20 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                  {user.firstName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.secondName ? `${user.secondName} ` : ""}{user.lastName}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                      user.status === "ACTIVE" || !user.status
                        ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                    }`}
                  >
                    {user.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Personal Details */}
            <div className="py-5 border-b border-gray-100">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {personalDetails.map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Account & System Details */}
            <div className="py-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
                Account & Access Details
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {systemDetails.map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
              {canUpdate && (
                <button
                  onClick={() => navigate(`/users/${user.id}/edit`)}
                  className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Edit / Update
                </button>
              )}
              {canCreate && (
                <button
                  onClick={() => navigate("/users/register")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Add User
                </button>
              )}
              {canDelete && (
                <button
                  onClick={deleteUser}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
