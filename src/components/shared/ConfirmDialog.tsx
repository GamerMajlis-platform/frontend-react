import React from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!open) return null;

  const node = (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative max-w-md w-full bg-[#0b0b0b] border border-[rgba(255,255,255,0.04)] rounded-lg p-4 shadow-lg pointer-events-auto transform transition-all duration-150 ease-out scale-100 opacity-100">
        <h3 className="text-lg font-semibold text-gray-100">
          {title ?? t("common.confirm")}
        </h3>
        <p className="text-sm text-gray-300 mt-2">
          {message ?? t("common.areYouSure")}
        </p>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-transparent text-sm text-gray-300 rounded-md"
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#ef4444] text-white rounded-md text-sm"
          >
            {confirmLabel ?? t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? ReactDOM.createPortal(node, document.body)
    : node;
};

export default ConfirmDialog;
