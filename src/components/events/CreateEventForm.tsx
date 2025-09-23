import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CreateEventRequest,
  EventType,
  LocationType,
  GameCategory,
  EventFormErrors,
} from "../../types/events";

interface CreateEventFormProps {
  onSubmit: (data: CreateEventRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CreateEventForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreateEventFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    eventType: "COMMUNITY_GATHERING",
    locationType: "VIRTUAL",
    virtualLink: "",
    virtualPlatform: "",
    physicalAddress: "",
    physicalVenue: "",
    maxAttendees: undefined,
    requiresRegistration: true,
    registrationDeadline: "",
    registrationRequirements: "",
    isPublic: true,
    gameTitle: "",
    gameCategory: undefined,
    competitive: false,
    entryFee: undefined,
    ageRestriction: undefined,
  });

  const [errors, setErrors] = useState<EventFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: EventFormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = t("events:validation.titleRequired");
    } else if (formData.title.length < 3) {
      newErrors.titleMinLength = t("events:validation.titleMinLength");
    } else if (formData.title.length > 100) {
      newErrors.titleMaxLength = t("events:validation.titleMaxLength");
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.descriptionMaxLength = t(
        "events:validation.descriptionMaxLength"
      );
    }

    // Start date validation
    if (!formData.startDateTime) {
      newErrors.startDateTimeRequired = t(
        "events:validation.startDateTimeRequired"
      );
    } else if (new Date(formData.startDateTime) <= new Date()) {
      newErrors.startDateTimeFuture = t(
        "events:validation.startDateTimeFuture"
      );
    }

    // End date validation
    if (formData.endDateTime && formData.startDateTime) {
      if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
        newErrors.endDateTimeAfterStart = t(
          "events:validation.endDateTimeAfterStart"
        );
      }
    }

    // Max attendees validation
    if (formData.maxAttendees !== undefined) {
      if (formData.maxAttendees <= 0) {
        newErrors.maxAttendeesPositive = t(
          "events:validation.maxAttendeesPositive"
        );
      } else if (formData.maxAttendees > 10000) {
        newErrors.maxAttendeesMax = t("events:validation.maxAttendeesMax");
      }
    }

    // Registration deadline validation
    if (formData.registrationDeadline && formData.startDateTime) {
      if (
        new Date(formData.registrationDeadline) >=
        new Date(formData.startDateTime)
      ) {
        newErrors.registrationDeadlineBeforeStart = t(
          "events:validation.registrationDeadlineBeforeStart"
        );
      }
    }

    // Entry fee validation
    if (formData.entryFee !== undefined) {
      if (formData.entryFee < 0) {
        newErrors.entryFeePositive = t("events:validation.entryFeePositive");
      } else if (formData.entryFee > 10000) {
        newErrors.entryFeeMax = t("events:validation.entryFeeMax");
      }
    }

    // Age restriction validation
    if (formData.ageRestriction !== undefined) {
      if (formData.ageRestriction < 1 || formData.ageRestriction > 99) {
        newErrors.ageRestrictionRange = t(
          "events:validation.ageRestrictionRange"
        );
      }
    }

    // Location-specific validation
    if (
      formData.locationType === "VIRTUAL" ||
      formData.locationType === "HYBRID"
    ) {
      if (!formData.virtualLink?.trim()) {
        newErrors.virtualLinkRequired = t(
          "events:validation.virtualLinkRequired"
        );
      } else if (formData.virtualLink && !isValidUrl(formData.virtualLink)) {
        newErrors.virtualLinkValid = t("events:validation.virtualLinkValid");
      }
    }

    if (
      formData.locationType === "PHYSICAL" ||
      formData.locationType === "HYBRID"
    ) {
      if (!formData.physicalAddress?.trim()) {
        newErrors.physicalAddressRequired = t(
          "events:validation.physicalAddressRequired"
        );
      }
      if (!formData.physicalVenue?.trim()) {
        newErrors.physicalVenueRequired = t(
          "events:validation.physicalVenueRequired"
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      setErrors({ general: t("events:messages.createError") });
    }
  };

  const handleInputChange = (
    field: keyof CreateEventRequest,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear related error when user starts typing
    if (errors[field as keyof EventFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderError = (field: keyof EventFormErrors) => {
    const error = errors[field];
    if (!error) return null;
    return <p className="mt-1 text-sm text-red-400">{error}</p>;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-[#1C2541] rounded-xl p-6 space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {t("events:createEvent")}
        </h2>
      </div>

      {errors.general && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{errors.general}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-white mb-2"
        >
          {t("events:form.title")} *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder={t("events:form.placeholders.title")}
          className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
          disabled={isSubmitting}
          required
        />
        {renderError("title")}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-white mb-2"
        >
          {t("events:form.description")}
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder={t("events:form.placeholders.description")}
          rows={4}
          className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
          disabled={isSubmitting}
        />
        {renderError("description")}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDateTime"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.startDateTime")} *
          </label>
          <input
            type="datetime-local"
            id="startDateTime"
            value={formData.startDateTime}
            onChange={(e) => handleInputChange("startDateTime", e.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
            required
          />
          {renderError("startDateTime")}
        </div>
        <div>
          <label
            htmlFor="endDateTime"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.endDateTime")}
          </label>
          <input
            type="datetime-local"
            id="endDateTime"
            value={formData.endDateTime}
            onChange={(e) => handleInputChange("endDateTime", e.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          />
          {renderError("endDateTime")}
        </div>
      </div>

      {/* Event Type and Location Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="eventType"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.eventType")}
          </label>
          <select
            id="eventType"
            value={formData.eventType}
            onChange={(e) =>
              handleInputChange("eventType", e.target.value as EventType)
            }
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          >
            <option value="COMMUNITY_GATHERING">
              {t("events:types.COMMUNITY_GATHERING")}
            </option>
            <option value="TOURNAMENT">{t("events:types.TOURNAMENT")}</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="locationType"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.locationType")}
          </label>
          <select
            id="locationType"
            value={formData.locationType}
            onChange={(e) =>
              handleInputChange("locationType", e.target.value as LocationType)
            }
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          >
            <option value="VIRTUAL">{t("events:locationTypes.VIRTUAL")}</option>
            <option value="PHYSICAL">
              {t("events:locationTypes.PHYSICAL")}
            </option>
            <option value="HYBRID">{t("events:locationTypes.HYBRID")}</option>
          </select>
        </div>
      </div>

      {/* Virtual Location Fields */}
      {(formData.locationType === "VIRTUAL" ||
        formData.locationType === "HYBRID") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="virtualLink"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("events:form.virtualLink")} *
            </label>
            <input
              type="url"
              id="virtualLink"
              value={formData.virtualLink}
              onChange={(e) => handleInputChange("virtualLink", e.target.value)}
              placeholder={t("events:form.placeholders.virtualLink")}
              className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              disabled={isSubmitting}
            />
            {renderError("virtualLink")}
          </div>
          <div>
            <label
              htmlFor="virtualPlatform"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("events:form.virtualPlatform")}
            </label>
            <input
              type="text"
              id="virtualPlatform"
              value={formData.virtualPlatform}
              onChange={(e) =>
                handleInputChange("virtualPlatform", e.target.value)
              }
              placeholder={t("events:form.placeholders.virtualPlatform")}
              className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Physical Location Fields */}
      {(formData.locationType === "PHYSICAL" ||
        formData.locationType === "HYBRID") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="physicalVenue"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("events:form.physicalVenue")} *
            </label>
            <input
              type="text"
              id="physicalVenue"
              value={formData.physicalVenue}
              onChange={(e) =>
                handleInputChange("physicalVenue", e.target.value)
              }
              placeholder={t("events:form.placeholders.physicalVenue")}
              className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              disabled={isSubmitting}
            />
            {renderError("physicalVenue")}
          </div>
          <div>
            <label
              htmlFor="physicalAddress"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("events:form.physicalAddress")} *
            </label>
            <input
              type="text"
              id="physicalAddress"
              value={formData.physicalAddress}
              onChange={(e) =>
                handleInputChange("physicalAddress", e.target.value)
              }
              placeholder={t("events:form.placeholders.physicalAddress")}
              className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              disabled={isSubmitting}
            />
            {renderError("physicalAddress")}
          </div>
        </div>
      )}

      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="gameTitle"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.gameTitle")}
          </label>
          <input
            type="text"
            id="gameTitle"
            value={formData.gameTitle}
            onChange={(e) => handleInputChange("gameTitle", e.target.value)}
            placeholder={t("events:form.placeholders.gameTitle")}
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label
            htmlFor="gameCategory"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.gameCategory")}
          </label>
          <select
            id="gameCategory"
            value={formData.gameCategory || ""}
            onChange={(e) =>
              handleInputChange(
                "gameCategory",
                (e.target.value as GameCategory) || undefined
              )
            }
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          >
            <option value="">{t("common.select")}</option>
            <option value="FPS">{t("events:gameCategories.FPS")}</option>
            <option value="MOBA">{t("events:gameCategories.MOBA")}</option>
            <option value="RPG">{t("events:gameCategories.RPG")}</option>
            <option value="STRATEGY">
              {t("events:gameCategories.STRATEGY")}
            </option>
            <option value="SPORTS">{t("events:gameCategories.SPORTS")}</option>
            <option value="RACING">{t("events:gameCategories.RACING")}</option>
            <option value="FIGHTING">
              {t("events:gameCategories.FIGHTING")}
            </option>
            <option value="OTHER">{t("events:gameCategories.OTHER")}</option>
          </select>
        </div>
      </div>

      {/* Registration and Fees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="maxAttendees"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.maxAttendees")}
          </label>
          <input
            type="number"
            id="maxAttendees"
            value={formData.maxAttendees || ""}
            onChange={(e) =>
              handleInputChange(
                "maxAttendees",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder={t("events:form.placeholders.maxAttendees")}
            min="1"
            max="10000"
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          />
          {renderError("maxAttendees")}
        </div>
        <div>
          <label
            htmlFor="entryFee"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.entryFee")}
          </label>
          <input
            type="number"
            id="entryFee"
            value={formData.entryFee || ""}
            onChange={(e) =>
              handleInputChange(
                "entryFee",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            placeholder={t("events:form.placeholders.entryFee")}
            min="0"
            step="0.01"
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          />
          {renderError("entryFee")}
        </div>
        <div>
          <label
            htmlFor="ageRestriction"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("events:form.ageRestriction")}
          </label>
          <input
            type="number"
            id="ageRestriction"
            value={formData.ageRestriction || ""}
            onChange={(e) =>
              handleInputChange(
                "ageRestriction",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder={t("events:form.placeholders.ageRestriction")}
            min="1"
            max="99"
            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            disabled={isSubmitting}
          />
          {renderError("ageRestriction")}
        </div>
      </div>

      {/* Registration Deadline and Requirements */}
      {formData.requiresRegistration && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="registrationDeadline"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("events:form.registrationDeadline")}
            </label>
            <input
              type="datetime-local"
              id="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={(e) =>
                handleInputChange("registrationDeadline", e.target.value)
              }
              className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              disabled={isSubmitting}
            />
            {renderError("registrationDeadline")}
          </div>
          <div>
            <label
              htmlFor="registrationRequirements"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("events:form.registrationRequirements")}
            </label>
            <input
              type="text"
              id="registrationRequirements"
              value={formData.registrationRequirements}
              onChange={(e) =>
                handleInputChange("registrationRequirements", e.target.value)
              }
              placeholder={t(
                "events:form.placeholders.registrationRequirements"
              )}
              className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Toggle Options */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requiresRegistration"
            checked={formData.requiresRegistration}
            onChange={(e) =>
              handleInputChange("requiresRegistration", e.target.checked)
            }
            className="h-4 w-4 text-cyan-300 focus:ring-cyan-300 border-slate-600 rounded bg-[#0F172A]"
            disabled={isSubmitting}
          />
          <label
            htmlFor="requiresRegistration"
            className="ml-3 text-sm text-white"
          >
            {t("events:form.requiresRegistration")}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="competitive"
            checked={formData.competitive}
            onChange={(e) => handleInputChange("competitive", e.target.checked)}
            className="h-4 w-4 text-cyan-300 focus:ring-cyan-300 border-slate-600 rounded bg-[#0F172A]"
            disabled={isSubmitting}
          />
          <label htmlFor="competitive" className="ml-3 text-sm text-white">
            {t("events:form.competitive")}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleInputChange("isPublic", e.target.checked)}
            className="h-4 w-4 text-cyan-300 focus:ring-cyan-300 border-slate-600 rounded bg-[#0F172A]"
            disabled={isSubmitting}
          />
          <label htmlFor="isPublic" className="ml-3 text-sm text-white">
            {t("events:form.isPublic")}
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
          disabled={isSubmitting}
        >
          {t("events:form.cancel")}
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("common.loading") : t("events:form.create")}
        </button>
      </div>
    </form>
  );
}
