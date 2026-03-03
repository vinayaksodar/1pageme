"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "info";
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    onClose();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const variantStyles = {
    danger: {
      button: "bg-red-500 hover:bg-red-600",
      icon: "bg-red-50 text-red-500",
      iconBg: "bg-red-100",
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 text-slate-900 md:p-12">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="animate-in fade-in zoom-in relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-left shadow-2xl duration-200">
        <div className="p-8">
          <div className="mb-6 flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${currentVariant.iconBg}`}
            >
              <AlertTriangle className={currentVariant.icon} size={24} />
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-xl font-black tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="text-sm leading-relaxed font-medium text-slate-500">
              {message}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="rounded-xl px-6 py-3 text-xs font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-900"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`rounded-xl px-8 py-3 text-xs font-black tracking-widest text-white uppercase shadow-xl transition-all active:scale-95 ${currentVariant.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
