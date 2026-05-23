"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getExciseDuties, createExciseDuty, updateExciseDuty, deleteExciseDuty } from "./actions";

interface ExciseDutyEntry {
  id: string;
  fromAmount: number;
  toAmount: number;
  dutyAmount: number;
}

export default function ExciseDutyApp() {
  const [entries, setEntries] = useState<ExciseDutyEntry[]>([]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [dutyAmount, setDutyAmount] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getExciseDuties();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const from = parseFloat(fromAmount);
    const to = parseFloat(toAmount);
    const duty = parseFloat(dutyAmount);

    if (isNaN(from) || isNaN(to) || isNaN(duty)) {
      alert("Please enter valid numbers");
      return;
    }

    try {
      if (editingId) {
        await updateExciseDuty(editingId, { fromAmount: from, toAmount: to, dutyAmount: duty });
        setEditingId(null);
      } else {
        await createExciseDuty({ fromAmount: from, toAmount: to, dutyAmount: duty });
      }
      setFromAmount("");
      setToAmount("");
      setDutyAmount("");
      loadEntries();
    } catch (error) {
      alert("Failed to save entry");
    }
  };

  const handleEdit = (entry: ExciseDutyEntry) => {
    setEditingId(entry.id);
    setFromAmount(entry.fromAmount.toString());
    setToAmount(entry.toAmount.toString());
    setDutyAmount(entry.dutyAmount.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFromAmount("");
    setToAmount("");
    setDutyAmount("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteExciseDuty(id);
      loadEntries();
    } catch (error) {
      alert("Failed to delete entry");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/apps/dashboard"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Excise Duty</h1>
          <p className="text-gray-500 mt-2">Manage your excise duty tiers and ranges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit Duty Tier" : "Add New Duty Tier"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Amount</label>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Amount</label>
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="100000.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excise Duty</label>
                <input
                  type="number"
                  value={dutyAmount}
                  onChange={(e) => setDutyAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="150.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className={`w-full py-3 text-white font-semibold rounded-lg transition-colors shadow-sm ${
                    editingId ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {editingId ? "Update Duty Tier" : "Save Duty Tier"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Saved Excise Duty Tiers</h2>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-gray-500">Loading saved tiers...</div>
              ) : entries.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No saved tiers yet. Add one to get started.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-4 font-semibold">From Amount</th>
                      <th className="px-6 py-4 font-semibold">To Amount</th>
                      <th className="px-6 py-4 font-semibold">Excise Duty</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {entries.map((entry) => (
                      <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${editingId === entry.id ? 'bg-amber-50 hover:bg-amber-50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {new Intl.NumberFormat("en-US").format(entry.fromAmount)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Intl.NumberFormat("en-US").format(entry.toAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm">
                            {new Intl.NumberFormat("en-US").format(entry.dutyAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
