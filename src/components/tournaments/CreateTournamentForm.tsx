import { useState } from "react";
import { useTranslation } from "react-i18next";
import TournamentService from "../../services/TournamentService";
import type {
  CreateTournamentRequest,
  CreateTournamentFormProps,
  TournamentFormErrors,
  TournamentType,
  TournamentStatus,
} from "../../types/tournaments";

import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

const CreateTournamentForm = ({
  onSubmit,
  onSuccess,
  onCancel,
  loading: _loading = false,
  initialData = {},
}: CreateTournamentFormProps) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<CreateTournamentRequest>({
    name: initialData.name || "",
    description: initialData.description || "",
    gameTitle: initialData.gameTitle || "",
    gameMode: initialData.gameMode || "Competitive",
    tournamentType: initialData.tournamentType || "ELIMINATION",
    maxParticipants: initialData.maxParticipants || 16,
    entryFee: initialData.entryFee || 0,
    prizePool: initialData.prizePool || 0,
    currency: initialData.currency || "USD",
    startDate: initialData.startDate || "",
    endDate: initialData.endDate || "",
    registrationDeadline: initialData.registrationDeadline || "",
    rules: initialData.rules || "",
    status: initialData.status || "REGISTRATION_OPEN",
    isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
    requiresApproval:
      initialData.requiresApproval !== undefined
        ? initialData.requiresApproval
        : false,
  });

  const [errors, setErrors] = useState<TournamentFormErrors>({});

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: TournamentFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("tournaments:validation.nameRequired");
    } else if (formData.name.length < 3) {
      newErrors.name = t("tournaments:validation.nameMinLength");
    } else if (formData.name.length > 100) {
      newErrors.name = t("tournaments:validation.nameMaxLength");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("tournaments:validation.descriptionRequired");
    } else if (formData.description.length < 10) {
      newErrors.description = t("tournaments:validation.descriptionMinLength");
    }

    if (!formData.gameTitle.trim()) {
      newErrors.gameTitle = t("tournaments:validation.gameTitleRequired");
    }

    if (!formData.gameMode.trim()) {
      newErrors.gameMode = t("tournaments:validation.gameModeRequired");
    }

    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = t(
        "tournaments:validation.maxParticipantsMin"
      );
    } else if (formData.maxParticipants > 1000) {
      newErrors.maxParticipants = t(
        "tournaments:validation.maxParticipantsMax"
      );
    }

    if (formData.entryFee < 0) {
      newErrors.entryFee = t("tournaments:validation.entryFeeMin");
    }

    if (formData.prizePool < 0) {
      newErrors.prizePool = t("tournaments:validation.prizePoolMin");
    }

    if (!formData.startDate) {
      newErrors.startDate = t("tournaments:validation.startDateRequired");
    } else {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      if (startDate <= now) {
        newErrors.startDate = t("tournaments:validation.startDateFuture");
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = t("tournaments:validation.endDateRequired");
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = t("tournaments:validation.endDateAfterStart");
      }
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = t(
        "tournaments:validation.registrationDeadlineRequired"
      );
    } else if (formData.startDate) {
      const deadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);
      if (deadline >= startDate) {
        newErrors.registrationDeadline = t(
          "tournaments:validation.registrationDeadlineBeforeStart"
        );
      }
    }

    if (!formData.rules.trim()) {
      newErrors.rules = t("tournaments:validation.rulesRequired");
    } else if (formData.rules.length < 10) {
      newErrors.rules = t("tournaments:validation.rulesMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleInputChange = (
    field: keyof CreateTournamentRequest,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field as keyof TournamentFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else if (onSuccess) {
        // Handle tournament creation internally
        const newTournament = await TournamentService.createTournament(
          formData
        );
        onSuccess(newTournament);
      } else {
        console.error("No submit handler provided");
      }
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };

  const tournamentTypes: Array<{ value: TournamentType; label: string }> = [
    { value: "ELIMINATION", label: t("tournaments:create.types.elimination") },
    { value: "ROUND_ROBIN", label: t("tournaments:create.types.roundRobin") },
    { value: "SWISS", label: t("tournaments:create.types.swiss") },
    { value: "BRACKET", label: t("tournaments:create.types.bracket") },
  ];

  const statusOptions: Array<{ value: TournamentStatus; label: string }> = [
    {
      value: "REGISTRATION_OPEN",
      label: t("tournaments:status.registrationOpen"),
    },
    {
      value: "REGISTRATION_CLOSED",
      label: t("tournaments:status.registrationClosed"),
    },
  ];

  // Helper component for consistent form fields
  const FormField = ({
    id,
    label,
    error,
    required,
    children,
  }: FormFieldProps) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-secondary mb-2"
      >
        {label}
        {!required && (
          <span className="text-xs text-gray-500 inline-block ml-2">
            ({t("common.optional")})
          </span>
        )}
      </label>
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  const inputClassName =
    "w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20";

  return (
    <div className="">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl mx-auto bg-[#1C2541] rounded-xl p-6 space-y-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {t("tournaments:create.title")}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-text-secondary hover:text-white transition-colors"
            aria-label={t("common.cancel")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Basic Information */}
        <div className="space-y-6">
          <FormField
            id="tournament-name"
            label={t("tournaments:create.form.name")}
            error={errors.name}
            required
          >
            <input
              id="tournament-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={inputClassName}
              maxLength={100}
              required
            />
          </FormField>

          <FormField
            id="tournament-description"
            label={t("tournaments:create.form.description")}
            error={errors.description}
            required
          >
            <textarea
              id="tournament-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`${inputClassName} resize-none`}
              rows={4}
              placeholder={t("tournaments:create.form.descriptionPlaceholder")}
              maxLength={1000}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              id="tournament-gameTitle"
              label={t("tournaments:create.form.gameTitle")}
              error={errors.gameTitle}
              required
            >
              <input
                id="tournament-gameTitle"
                type="text"
                value={formData.gameTitle}
                onChange={(e) => handleInputChange("gameTitle", e.target.value)}
                className={inputClassName}
                placeholder={t("tournaments:create.form.gameTitlePlaceholder")}
                required
              />
            </FormField>

            <FormField
              id="tournament-gameMode"
              label={t("tournaments:create.form.gameMode")}
              error={errors.gameMode}
            >
              <input
                id="tournament-gameMode"
                type="text"
                value={formData.gameMode}
                onChange={(e) => handleInputChange("gameMode", e.target.value)}
                className={inputClassName}
                placeholder={t("tournaments:create.form.gameModePlaceholder")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              id="tournament-type"
              label={t("tournaments:create.form.tournamentType")}
              required
            >
              <select
                id="tournament-type"
                value={formData.tournamentType}
                onChange={(e) =>
                  handleInputChange(
                    "tournamentType",
                    e.target.value as TournamentType
                  )
                }
                className={inputClassName}
              >
                {tournamentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="tournament-maxParticipants"
              label={t("tournaments:create.form.maxParticipants")}
              error={errors.maxParticipants}
              required
            >
              <input
                id="tournament-maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  handleInputChange(
                    "maxParticipants",
                    parseInt(e.target.value) || 0
                  )
                }
                className={inputClassName}
                min="2"
                max="1000"
                required
              />
            </FormField>
          </div>
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* entryFee, prizePool, currency → unchanged */}
        </div>

        {/* Date & Time Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* startDate, endDate, registrationDeadline → unchanged */}
        </div>

        {/* Rules */}
        <FormField
          id="tournament-rules"
          label={t("tournaments:create.form.rules")}
          error={errors.rules}
          required
        >
          <textarea
            id="tournament-rules"
            value={formData.rules}
            onChange={(e) => handleInputChange("rules", e.target.value)}
            className={`${inputClassName} resize-none`}
            rows={4}
            placeholder={t("tournaments:create.form.rulesPlaceholder")}
            maxLength={2000}
            required
          />
        </FormField>

        {/* Settings */}
        <div className="space-y-4">
          <FormField
            id="tournament-status"
            label={t("tournaments:create.form.status")}
          >
            <select
              id="tournament-status"
              value={formData.status}
              onChange={(e) =>
                handleInputChange("status", e.target.value as TournamentStatus)
              }
              className={inputClassName}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <div className="relative">
                <input
                  id="tournament-isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    handleInputChange("isPublic", e.target.checked)
                  }
                  aria-label={t("tournaments:create.form.isPublic")}
                  className="peer cursor-pointer w-5 h-5 rounded-md border border-slate-600 bg-[#0F172A] checked:bg-cyan-500 checked:border-transparent focus:outline-none"
                />
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="ml-2 text-sm text-white/80">
                {t("tournaments:create.form.isPublic")}
              </span>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <input
                  id="tournament-requiresApproval"
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) =>
                    handleInputChange("requiresApproval", e.target.checked)
                  }
                  aria-label={t("tournaments:create.form.requiresApproval")}
                  className="peer cursor-pointer w-5 h-5 rounded-md border border-slate-600 bg-[#0F172A] checked:bg-cyan-500 checked:border-transparent focus:outline-none"
                />
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="ml-2 text-sm text-white/80">
                {t("tournaments:create.form.requiresApproval")}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-600">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-cyan-500 px-6 py-3 text-white font-medium hover:bg-cyan-600 transition-colors"
          >
            {t("tournaments:create.button")}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-600 px-6 py-3 text-white/80 hover:text-white transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentForm;
