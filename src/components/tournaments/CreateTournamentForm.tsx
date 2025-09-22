import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CreateTournamentRequest,
  CreateTournamentFormProps,
  TournamentFormErrors,
  TournamentType,
  TournamentStatus,
} from "../../types/tournaments";

const CreateTournamentForm: React.FC<CreateTournamentFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData = {},
}) => {
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
      newErrors.name = t("tournaments.validation.nameRequired");
    } else if (formData.name.length < 3) {
      newErrors.name = t("tournaments.validation.nameMinLength");
    } else if (formData.name.length > 100) {
      newErrors.name = t("tournaments.validation.nameMaxLength");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("tournaments.validation.descriptionRequired");
    } else if (formData.description.length < 10) {
      newErrors.description = t("tournaments.validation.descriptionMinLength");
    }

    if (!formData.gameTitle.trim()) {
      newErrors.gameTitle = t("tournaments.validation.gameTitleRequired");
    }

    if (!formData.gameMode.trim()) {
      newErrors.gameMode = t("tournaments.validation.gameModeRequired");
    }

    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = t(
        "tournaments.validation.maxParticipantsMin"
      );
    } else if (formData.maxParticipants > 1000) {
      newErrors.maxParticipants = t(
        "tournaments.validation.maxParticipantsMax"
      );
    }

    if (formData.entryFee < 0) {
      newErrors.entryFee = t("tournaments.validation.entryFeeMin");
    }

    if (formData.prizePool < 0) {
      newErrors.prizePool = t("tournaments.validation.prizePoolMin");
    }

    if (!formData.startDate) {
      newErrors.startDate = t("tournaments.validation.startDateRequired");
    } else {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      if (startDate <= now) {
        newErrors.startDate = t("tournaments.validation.startDateFuture");
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = t("tournaments.validation.endDateRequired");
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = t("tournaments.validation.endDateAfterStart");
      }
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = t(
        "tournaments.validation.registrationDeadlineRequired"
      );
    } else if (formData.startDate) {
      const deadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);
      if (deadline >= startDate) {
        newErrors.registrationDeadline = t(
          "tournaments.validation.registrationDeadlineBeforeStart"
        );
      }
    }

    if (!formData.rules.trim()) {
      newErrors.rules = t("tournaments.validation.rulesRequired");
    } else if (formData.rules.length < 10) {
      newErrors.rules = t("tournaments.validation.rulesMinLength");
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
      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };

  const tournamentTypes: Array<{ value: TournamentType; label: string }> = [
    { value: "ELIMINATION", label: t("tournaments.types.elimination") },
    { value: "ROUND_ROBIN", label: t("tournaments.types.roundRobin") },
    { value: "SWISS", label: t("tournaments.types.swiss") },
    { value: "BRACKET", label: t("tournaments.types.bracket") },
  ];

  const statusOptions: Array<{ value: TournamentStatus; label: string }> = [
    {
      value: "REGISTRATION_OPEN",
      label: t("tournaments.status.registrationOpen"),
    },
    {
      value: "REGISTRATION_CLOSED",
      label: t("tournaments.status.registrationClosed"),
    },
  ];

  const currencyOptions = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "SAR", label: "SAR (﷼)" },
    { value: "AED", label: "AED (د.إ)" },
  ];

  // Helper component for consistent form fields
  const FormField: React.FC<{
    id: string;
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
  }> = ({ id, label, error, required, children }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-secondary mb-2"
      >
        {label} {required && "*"}
      </label>
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  const inputClassName =
    "w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

  return (
    <div className="bg-dark-secondary rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {t("tournaments.create.title")}
        </h2>
        <button
          onClick={onCancel}
          className="text-text-secondary hover:text-white transition-colors"
          aria-label={t("common.close")}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <FormField
              id="tournament-name"
              label={t("tournaments.form.name")}
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
          </div>

          <div className="lg:col-span-2">
            <FormField
              id="tournament-description"
              label={t("tournaments.form.description")}
              error={errors.description}
              required
            >
              <textarea
                id="tournament-description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={`${inputClassName} resize-none`}
                rows={4}
                placeholder={t("tournaments.form.descriptionPlaceholder")}
                maxLength={1000}
                required
              />
            </FormField>
          </div>

          <FormField
            id="tournament-gameTitle"
            label={t("tournaments.form.gameTitle")}
            error={errors.gameTitle}
            required
          >
            <input
              id="tournament-gameTitle"
              type="text"
              value={formData.gameTitle}
              onChange={(e) => handleInputChange("gameTitle", e.target.value)}
              className={inputClassName}
              placeholder={t("tournaments.form.gameTitlePlaceholder")}
              required
            />
          </FormField>

          <FormField
            id="tournament-gameMode"
            label={t("tournaments.form.gameMode")}
            error={errors.gameMode}
          >
            <input
              id="tournament-gameMode"
              type="text"
              value={formData.gameMode}
              onChange={(e) => handleInputChange("gameMode", e.target.value)}
              className={inputClassName}
              placeholder={t("tournaments.form.gameModePlaceholder")}
            />
          </FormField>

          <FormField
            id="tournament-type"
            label={t("tournaments.form.tournamentType")}
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
            label={t("tournaments.form.maxParticipants")}
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

        {/* Financial Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField
            id="tournament-entryFee"
            label={t("tournaments.form.entryFee")}
            error={errors.entryFee}
          >
            <input
              id="tournament-entryFee"
              type="number"
              step="0.01"
              value={formData.entryFee}
              onChange={(e) =>
                handleInputChange("entryFee", parseFloat(e.target.value) || 0)
              }
              className={inputClassName}
              min="0"
            />
          </FormField>

          <FormField
            id="tournament-prizePool"
            label={t("tournaments.form.prizePool")}
            error={errors.prizePool}
          >
            <input
              id="tournament-prizePool"
              type="number"
              step="0.01"
              value={formData.prizePool}
              onChange={(e) =>
                handleInputChange("prizePool", parseFloat(e.target.value) || 0)
              }
              className={inputClassName}
              min="0"
            />
          </FormField>

          <FormField
            id="tournament-currency"
            label={t("tournaments.form.currency")}
          >
            <select
              id="tournament-currency"
              value={formData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className={inputClassName}
            >
              {currencyOptions.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Date & Time Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField
            id="tournament-startDate"
            label={t("tournaments.form.startDate")}
            error={errors.startDate}
            required
          >
            <input
              id="tournament-startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className={inputClassName}
              required
            />
          </FormField>

          <FormField
            id="tournament-endDate"
            label={t("tournaments.form.endDate")}
            error={errors.endDate}
            required
          >
            <input
              id="tournament-endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className={inputClassName}
              required
            />
          </FormField>

          <FormField
            id="tournament-registrationDeadline"
            label={t("tournaments.form.registrationDeadline")}
            error={errors.registrationDeadline}
            required
          >
            <input
              id="tournament-registrationDeadline"
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={(e) =>
                handleInputChange("registrationDeadline", e.target.value)
              }
              className={inputClassName}
              required
            />
          </FormField>
        </div>

        {/* Rules */}
        <FormField
          id="tournament-rules"
          label={t("tournaments.form.rules")}
          error={errors.rules}
          required
        >
          <textarea
            id="tournament-rules"
            value={formData.rules}
            onChange={(e) => handleInputChange("rules", e.target.value)}
            className={`${inputClassName} resize-none`}
            rows={4}
            placeholder={t("tournaments.form.rulesPlaceholder")}
            maxLength={2000}
            required
          />
        </FormField>

        {/* Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            id="tournament-status"
            label={t("tournaments.form.status")}
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

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="tournament-isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  handleInputChange("isPublic", e.target.checked)
                }
                className="w-4 h-4 text-primary bg-dark border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="tournament-isPublic"
                className="ml-2 text-sm text-text-secondary"
              >
                {t("tournaments.form.isPublic")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="tournament-requiresApproval"
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) =>
                  handleInputChange("requiresApproval", e.target.checked)
                }
                className="w-4 h-4 text-primary bg-dark border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="tournament-requiresApproval"
                className="ml-2 text-sm text-text-secondary"
              >
                {t("tournaments.form.requiresApproval")}
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-600">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary-hover text-dark font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? t("common.creating") : t("tournaments.create.submit")}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentForm;
