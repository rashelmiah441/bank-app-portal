"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toPng, toJpeg } from "html-to-image";

export default function BranchLogoGenerator() {
  const [branchNameEn, setBranchNameEn] = useState("");
  const [branchNameBn, setBranchNameBn] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  
  // Data specifically for the preview/download
  const [previewData, setPreviewData] = useState({
    nameEn: "",
    nameBn: "",
    phone: "",
    email: ""
  });
  
  const [isGenerated, setIsGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!branchNameEn && !branchNameBn) {
      alert("Please enter at least one Branch Name");
      return;
    }
    
    setPreviewData({
      nameEn: branchNameEn,
      nameBn: branchNameBn,
      phone: branchPhone,
      email: branchEmail
    });
    
    setIsGenerated(true);
  };

  // Helper to calculate font size based on length
  const getEnFontSize = (text: string) => {
    if (text.length > 35) return "9pt";
    if (text.length > 28) return "11pt";
    if (text.length > 18) return "13pt";
    return "15pt";
  };

  const getBnFontSize = (text: string) => {
    if (text.length > 30) return "11pt";
    if (text.length > 22) return "13pt";
    if (text.length > 14) return "15pt";
    return "18pt";
  };

  const handleDownload = async (format: "png" | "jpg") => {
    if (!logoRef.current) return;
    
    setIsDownloading(true);
    try {
      const options = {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 3, // High quality
      };

      const dataUrl = format === "png" 
        ? await toPng(logoRef.current, options)
        : await toJpeg(logoRef.current, options);
      
      const fileName = (previewData.nameEn || previewData.nameBn).toLowerCase().replace(/\s+/g, "-");
      const link = document.createElement("a");
      link.download = `branch-logo-${fileName}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Oops, something went wrong!", err);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Branch Logo Generator</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Branch Name (English)</label>
            <input
              type="text"
              value={branchNameEn}
              onChange={(e) => setBranchNameEn(e.target.value)}
              placeholder="e.g. Main Branch"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">শাখার নাম (বাংলা)</label>
            <input
              type="text"
              value={branchNameBn}
              onChange={(e) => setBranchNameBn(e.target.value)}
              placeholder="উদা: প্রধান শাখা"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Branch Phone</label>
            <input
              type="text"
              value={branchPhone}
              onChange={(e) => setBranchPhone(e.target.value)}
              placeholder="e.g. +880..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Branch Email</label>
            <input
              type="email"
              value={branchEmail}
              onChange={(e) => setBranchEmail(e.target.value)}
              placeholder="e.g. branch@agrani.com"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {isGenerated ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </>
            ) : "Generate"}
          </button>
          {isGenerated && (
            <button
              disabled={isDownloading}
              onClick={() => handleDownload("png")}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isDownloading ? "Downloading..." : "Download PNG"}
            </button>
          )}
        </div>
      </div>

      {isGenerated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Preview (A4 Width: 210mm)</h2>
            <p className="text-xs text-gray-500 italic">* Displayed scaled to fit your screen</p>
          </div>
          <div className="bg-gray-100 p-4 md:p-8 rounded-xl border border-dashed border-gray-400 flex justify-center overflow-hidden">
            {/* Responsive Wrapper for Preview */}
            <div className="w-full flex justify-center" style={{ maxWidth: "210mm" }}>
              <div 
                ref={logoRef}
                className="bg-white flex items-center shadow-sm"
                style={{
                  width: "210mm",
                  minWidth: "210mm",
                  height: "29.7mm", // Reverted to 10% of A4 length (297mm)
                  padding: "0 4mm",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              >
                {/* Left: Logo (Reverted to 55% width, aligned left) */}
                <div className="flex-shrink-0 flex items-center justify-start" style={{ width: "55%", height: "85%" }}>
                  <img 
                    src="/agrani_plc_logo.png" 
                    alt="Agrani PLC Logo" 
                    className="h-full w-auto object-contain"
                  />
                </div>

                {/* Middle: Divider Line */}
                <div className="mx-3 h-2/3 w-px bg-gray-300"></div>

                {/* Right: Branch Info (Remaining space, aligned right) */}
                <div className="flex-grow flex flex-col justify-center text-right text-[#006837] overflow-hidden">
                  {previewData.nameBn && (
                    <div className="font-bold tracking-tight truncate" style={{ fontSize: getBnFontSize(previewData.nameBn), lineHeight: "1.1" }}>
                      {previewData.nameBn}
                    </div>
                  )}
                  {previewData.nameEn && (
                    <div className="font-bold uppercase tracking-tight truncate" style={{ fontSize: getEnFontSize(previewData.nameEn), lineHeight: "1.2" }}>
                      {previewData.nameEn}
                    </div>
                  )}
                  <div 
                    className={`font-bold flex ${previewData.phone.length > 20 ? "flex-col" : "flex-row items-center"} justify-end`} 
                    style={{ fontSize: "10pt", opacity: "1", marginTop: "2mm", lineHeight: "1.2" }}
                  >
                    {previewData.phone && (
                      <span className="whitespace-nowrap">
                        Phone: {previewData.phone}
                        {previewData.email && previewData.phone.length <= 20 && <span className="mx-1">|</span>}
                      </span>
                    )}
                    {previewData.email && <span className="whitespace-nowrap">Email: {previewData.email}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media screen and (max-width: 220mm) {
          .bg-white.flex.items-center.shadow-sm {
            transform: scale(calc(100vw / 240mm));
            transform-origin: center center;
          }
        }
      `}</style>
    </div>
  );
}
