import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EventService from "../services/EventService";
import type { Event } from "../types/events";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await EventService.getEvent(Number(id));
        if (res && res.event) setEvent(res.event);
        else setError(res?.message || t("common.error"));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await EventService.registerForEventWithValidation(event.id, {
        currentAttendees: event.currentAttendees,
        maxAttendees: event.maxAttendees,
        startDateTime: event.startDateTime,
      });
      // optimistic update
      setEvent((e) =>
        e ? { ...e, currentAttendees: e.currentAttendees + 1 } : e
      );
      setIsRegistered(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("common.error"));
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await EventService.unregisterFromEvent(event.id);
      setEvent((e) =>
        e ? { ...e, currentAttendees: Math.max(0, e.currentAttendees - 1) } : e
      );
      setIsRegistered(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("common.error"));
    } finally {
      setRegistering(false);
    }
  };

  if (loading)
    return (
      <div className="p-6">
        <div>{t("common.loading")}</div>
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-400">{error}</div>
        <button onClick={() => navigate(-1)} className="mt-4">
          {t("common.back")}
        </button>
      </div>
    );

  if (!event)
    return (
      <div className="p-6">
        <div>{t("events:notFound")}</div>
        <button onClick={() => navigate(-1)} className="mt-4">
          {t("common.back")}
        </button>
      </div>
    );

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
      <p className="text-sm text-slate-300 mb-4">{event.description}</p>
      <div className="mb-2">
        {t("labels.organizer")}: {event.organizer.displayName}
      </div>
      <div className="mb-2">
        {t("labels.startDate")}:{" "}
        {new Date(event.startDateTime).toLocaleString()}
      </div>
      <div className="mb-4">
        {t("labels.location")}: {event.locationType}
      </div>

      <div className="flex items-center gap-3">
        {!isRegistered ? (
          <button
            disabled={registering}
            onClick={handleRegister}
            className="rounded bg-cyan-500 px-4 py-2 text-black font-semibold"
          >
            {registering ? t("common.loading") : t("activity.join")}
          </button>
        ) : (
          <button
            disabled={registering}
            onClick={handleUnregister}
            className="rounded bg-yellow-400 px-4 py-2 text-black font-semibold"
          >
            {registering ? t("common.loading") : t("activity.leave")}
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="rounded border px-4 py-2"
        >
          {t("common.back")}
        </button>
      </div>
    </main>
  );
}
