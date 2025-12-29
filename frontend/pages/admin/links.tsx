"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface RegistrationLink {
  id: number;
  uniqueToken: string;
  trainingProgramId: number;
  trainingClassId: number;
  personnelTypeId: number;
  createdByAdminId: number;
  maxRegistrations: number;
  currentRegistrations: number;
  expiryDate: string;
  waGroupLink?: string;
  status: "active" | "expired" | "filled";
  createdAt: string;
  share_url?: string;
  qr_code_url?: string;
  // Relations
  trainingProgram?: {
    id: number;
    name: string;
    durationDays: number;
  };
  trainingClass?: {
    id: number;
    name: string;
    level: string;
  };
  personnelType?: {
    id: number;
    name: string;
  };
}

interface Bidang {
  id: string;
  name: string;
  code: string;
}

interface Kelas {
  id: string;
  name: string;
}

interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
}

interface MasterDataLoadingState {
  bidangs: boolean;
  kelas: boolean;
  programs: boolean;
}

interface MasterDataError {
  bidangs: string | null;
  kelas: string | null;
  programs: string | null;
}

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [bidangs, setBidangs] = useState<Bidang[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<RegistrationLink | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  // New state for better loading/error management
  const [masterDataLoading, setMasterDataLoading] =
    useState<MasterDataLoadingState>({
      bidangs: false,
      kelas: false,
      programs: false,
    });
  const [masterDataError, setMasterDataError] = useState<MasterDataError>({
    bidangs: null,
    kelas: null,
    programs: null,
  });

  const [formData, setFormData] = useState({
    trainingProgramId: "",
    trainingClassId: "",
    personnelTypeId: "",
    maxRegistrations: 25,
    expiryDate: "",
    waGroupLink: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchLinks();
    fetchMasterData();
  }, [router]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Fetching links with API_BASE_URL:", API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/api/admin/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Links response:", response.data);
      setLinks(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching master data...");

      // Fetch bidangs
      try {
        setMasterDataLoading((prev) => ({ ...prev, bidangs: true }));
        setMasterDataError((prev) => ({ ...prev, bidangs: null }));
        const bidangsRes = await axios.get(
          `${API_BASE_URL}/api/admin/master-data/bidang`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Bidangs response:", bidangsRes.data);
        setBidangs(bidangsRes.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch bidangs:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to load bidang data";
        setMasterDataError((prev) => ({ ...prev, bidangs: errorMsg }));
        setBidangs([]);
      } finally {
        setMasterDataLoading((prev) => ({ ...prev, bidangs: false }));
      }

      // Fetch kelas
      try {
        setMasterDataLoading((prev) => ({ ...prev, kelas: true }));
        setMasterDataError((prev) => ({ ...prev, kelas: null }));
        const kelasRes = await axios.get(
          `${API_BASE_URL}/api/admin/master-data/classes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Kelas response:", kelasRes.data);
        setKelas(kelasRes.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch kelas:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to load kelas data";
        setMasterDataError((prev) => ({ ...prev, kelas: errorMsg }));
        setKelas([]);
      } finally {
        setMasterDataLoading((prev) => ({ ...prev, kelas: false }));
      }

      // Fetch programs (Training)
      try {
        setMasterDataLoading((prev) => ({ ...prev, programs: true }));
        setMasterDataError((prev) => ({ ...prev, programs: null }));
        const programsRes = await axios.get(
          `${API_BASE_URL}/api/admin/master-data/training_programs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Programs response:", programsRes.data);
        setPrograms(programsRes.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch programs:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to load program data";
        setMasterDataError((prev) => ({ ...prev, programs: errorMsg }));
        setPrograms([]);
      } finally {
        setMasterDataLoading((prev) => ({ ...prev, programs: false }));
      }
    } catch (error) {
      console.error("Unexpected error in fetchMasterData:", error);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "trainingProgramId:",
      formData.trainingProgramId,
      typeof formData.trainingProgramId
    );
    console.log("formData at submit:", formData);
    // Validation
    if (!formData.trainingProgramId) {
      alert("❌ Pilih training terlebih dahulu");
      return;
    }

    if (!formData.trainingClassId) {
      alert("❌ Pilih kelas terlebih dahulu");
      return;
    }

    if (!formData.personnelTypeId) {
      alert("❌ Pilih tipe personel terlebih dahulu");
      return;
    }

    if (!formData.expiryDate) {
      alert("❌ Pilih tanggal kedaluwarsa terlebih dahulu");
      return;
    }

    // Validate selected training exists in programs
    const selectedTraining = programs.find(
      (p) => String(p.id) === String(formData.trainingProgramId)
    );
    if (!selectedTraining) {
      alert("❌ Training yang dipilih tidak valid");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      // Build payload matching UPDATED backend expectations
      const payload = {
        trainingProgramId: parseInt(formData.trainingProgramId),
        trainingClassId: parseInt(formData.trainingClassId),
        personnelTypeId: parseInt(formData.personnelTypeId),
        maxRegistrations: formData.maxRegistrations,
        expiryDate: formData.expiryDate,
        waGroupLink: formData.waGroupLink || undefined,
      };

      // Remove undefined values
      Object.keys(payload).forEach(
        (key) =>
          (payload as any)[key] === undefined && delete (payload as any)[key]
      );

      console.log("Creating link with payload:", payload);
      console.log("API URL:", `${API_BASE_URL}/api/admin/links`);

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/links`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Create response:", response.data);

      setFormData({
        trainingProgramId: "",
        trainingClassId: "",
        personnelTypeId: "",
        maxRegistrations: 25,
        expiryDate: "",
        waGroupLink: "",
      });
      setShowCreateModal(false);
      await fetchLinks();
      alert("✅ Link berhasil dibuat!");
    } catch (error: any) {
      console.error("Create error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Gagal membuat link";
      alert("❌ Gagal: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/links/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Delete response:", response.data);
      setShowDeleteConfirm(null);
      await fetchLinks();
      alert("✅ Link berhasil dihapus!");
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus link";
      alert("❌ Gagal: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 bg-opacity-20 text-green-400";
      case "expired":
        return "bg-red-500 bg-opacity-20 text-red-400";
      case "filled":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      default:
        return "bg-blue-500 bg-opacity-20 text-blue-400";
    }
  };

  const copyToClipboard = (token: string) => {
    const linkUrl = `${window.location.origin}/register/${token}`;
    navigator.clipboard.writeText(linkUrl);
    alert("✅ Link copied to clipboard!");
  };

  const handleOpenCreateModal = () => {
    console.log("Opening create modal");
    // Reset errors when opening modal
    setMasterDataError({ bidangs: null, kelas: null, programs: null });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading registration links...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Link Pendaftaran 🔗
            </h1>
            <p className="text-[#8fa3b8] mt-1">
              Kelola tautan pendaftaran peserta pelatihan
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 w-fit"
          >
            ➕ Buat Link Baru
          </button>
        </div>

        {/* Links Table */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d3e52]">
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">
                    Training
                  </th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">
                    Class
                  </th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">
                    Registrasi
                  </th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">
                    Exp Date
                  </th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center px-4 py-8 text-[#8fa3b8]"
                    >
                      Belum ada link pendaftaran. Buat link baru sekarang!
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b border-[#2d3e52] hover:bg-[#1a2332] transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-medium">
                        {link.trainingProgram?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        {link.trainingClass?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        <span className="text-blue-400 font-medium">
                          {link.currentRegistrations}
                        </span>
                        <span className="text-[#8fa3b8]">
                          /{link.maxRegistrations}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        {link.expiryDate
                          ? new Date(link.expiryDate).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                            getStatusColor(link.status)
                          }`}
                        >
                          {link.status === "active" && "✓ Active"}
                          {link.status === "expired" && "✗ Expired"}
                          {link.status === "filled" && "📦 Filled"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => copyToClipboard(link.uniqueToken)}
                            title="Copy link"
                            className="text-[#8fa3b8] hover:text-blue-400 transition-colors text-lg"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => setSelectedLink(link)}
                            title="View details"
                            className="text-[#8fa3b8] hover:text-green-400 transition-colors text-lg"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(link.id)}
                            title="Delete link"
                            className="text-[#8fa3b8] hover:text-red-400 transition-colors text-lg"
                            disabled={isSubmitting}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Link Modal - Matching the screenshot form */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Tambah Link Pendaftaran
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateLink} className="space-y-4">
                {/* Training Program */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Program Pelatihan *{" "}
                    {masterDataLoading.programs && (
                      <span className="text-xs text-gray-500">
                        (loading...)
                      </span>
                    )}
                  </label>
                  {masterDataError.programs && (
                    <p className="text-red-500 text-xs mb-2">
                      ⚠️ {masterDataError.programs}
                    </p>
                  )}
                  <select
                    value={formData.trainingProgramId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trainingProgramId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 bg-white"
                    required
                    disabled={isSubmitting || masterDataLoading.programs}
                  >
                    <option value="">-- Pilih Program Pelatihan --</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {programs.length === 0 &&
                    !masterDataLoading.programs &&
                    !masterDataError.programs && (
                      <p className="text-orange-500 text-xs mt-1">
                        ⚠️ Tidak ada program tersedia. Buat program di halaman
                        Master Data terlebih dahulu.
                      </p>
                    )}
                </div>

                {/* Training Class */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Kelas Pelatihan *{" "}
                    {masterDataLoading.kelas && (
                      <span className="text-xs text-gray-500">
                        (loading...)
                      </span>
                    )}
                  </label>
                  {masterDataError.kelas && (
                    <p className="text-red-500 text-xs mb-2">
                      ⚠️ {masterDataError.kelas}
                    </p>
                  )}
                  <select
                    value={formData.trainingClassId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trainingClassId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 bg-white"
                    required
                    disabled={isSubmitting || masterDataLoading.kelas}
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personnel Type */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tipe Personel *{" "}
                    {masterDataLoading.bidangs && (
                      <span className="text-xs text-gray-500">
                        (loading...)
                      </span>
                    )}
                  </label>
                  {masterDataError.bidangs && (
                    <p className="text-red-500 text-xs mb-2">
                      ⚠️ {masterDataError.bidangs}
                    </p>
                  )}
                  <select
                    value={formData.personnelTypeId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personnelTypeId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 bg-white"
                    required
                    disabled={isSubmitting || masterDataLoading.bidangs}
                  >
                    <option value="">-- Pilih Tipe Personel --</option>
                    {bidangs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Registrations */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Maksimal Pendaftar *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxRegistrations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRegistrations: parseInt(e.target.value) || 25,
                      })
                    }
                    className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tanggal Kadaluarsa *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Whatsapp Group Link */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Link Grup WhatsApp
                  </label>
                  <input
                    type="url"
                    value={formData.waGroupLink}
                    onChange={(e) =>
                      setFormData({ ...formData, waGroupLink: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    placeholder="https://chat.whatsapp.com/..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Button */}
                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors font-medium disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                    disabled={
                      isSubmitting ||
                      !formData.trainingProgramId ||
                      !formData.trainingClassId ||
                      !formData.personnelTypeId ||
                      !formData.expiryDate
                    }
                  >
                    {isSubmitting ? "⏳ Membuat..." : "✅ Buat"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-sm w-full">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Hapus Link?</h2>
                <p className="text-[#8fa3b8] mt-2">
                  Apakah Anda yakin ingin menghapus link pendaftaran ini?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeleteLink(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "⏳ Menghapus..." : "🗑️ Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link Details Modal */}
        {selectedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detail Link</h2>
                <button
                  onClick={() => setSelectedLink(null)}
                  className="text-[#8fa3b8] hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[#8fa3b8] text-sm">Program Pelatihan</p>
                  <p className="text-white font-semibold">
                    {selectedLink.trainingProgram?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Kelas</p>
                  <p className="text-white font-semibold">
                    {selectedLink.trainingClass?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Tipe Personel</p>
                  <p className="text-white font-semibold">
                    {selectedLink.personnelType?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Registration URL</p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={
                        selectedLink.share_url ||
                        `${window.location.origin}/register/${selectedLink.uniqueToken}`
                      }
                      readOnly
                      className="flex-1 bg-[#1a2332] border border-[#2d3e52] rounded px-3 py-2 text-[#8fa3b8] text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedLink.uniqueToken)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">QR Code</p>
                  {selectedLink.qr_code_url && (
                    <img
                      src={selectedLink.qr_code_url}
                      alt="QR Code"
                      className="w-32 h-32 mt-2"
                    />
                  )}
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Max Registrations</p>
                  <p className="text-white font-semibold">
                    {selectedLink.maxRegistrations}
                  </p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">
                    Current Registrations
                  </p>
                  <p className="text-white font-semibold">
                    {selectedLink.currentRegistrations}
                  </p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Expiry Date</p>
                  <p className="text-white font-semibold">
                    {selectedLink.expiryDate
                      ? new Date(selectedLink.expiryDate).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLink(null)}
                className="w-full mt-6 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
