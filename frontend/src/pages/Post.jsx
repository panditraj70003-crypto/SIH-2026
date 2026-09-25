import React, { useState } from "react";

import { Card, Button, Chip, Notice } from "../components/ui.jsx";
import {
  CameraIcon,
  VideoIcon,
  TextIcon,
  PinIcon,
  CheckIcon,
  WifiOffIcon,
} from "../components/icons.jsx";

import places from "../data/places.js";
import { reportTypes } from "../data/mockData.js";
import { useNotify } from "../context/NotifyContext.jsx";
import api from "../lib/api.js";

const severities = ["Low", "Moderate", "High", "Critical"];

const severityLevel = {
  Low: "low",
  Moderate: "moderate",
  High: "high",
  Critical: "critical",
};

function readAsDataUrl(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      return reject(new Error("too-large"));
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function Post() {
  const { addUserReport } = useNotify();

  const [type, setType] = useState(reportTypes[0]);
  const [severity, setSeverity] = useState("Moderate");

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");

  // Actual image file for backend upload
  const [photoFile, setPhotoFile] = useState(null);

  // Image preview for frontend
  const [photoPreview, setPhotoPreview] = useState(null);

  const [photoName, setPhotoName] = useState("");
  const [videoName, setVideoName] = useState("");

  const [coords, setCoords] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [submittedReports, setSubmittedReports] = useState([]);

  const stateObj = places.states.find((s) => s.id === stateId);

  // --------------------------------------------------
  // PHOTO
  // --------------------------------------------------

  async function onPhoto(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      if (file.size > 1_500_000) {
        throw new Error("too-large");
      }

      const preview = await readAsDataUrl(file, 1_500_000);

      setPhotoFile(file);
      setPhotoPreview(preview);
      setPhotoName(file.name);

      setError("");
    } catch {
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoName("");

      setError(
        "That photo is larger than 1.5 MB — choose a smaller one."
      );
    }
  }

  // --------------------------------------------------
  // VIDEO
  // --------------------------------------------------

  function onVideo(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 15_000_000) {
      setError(
        "That video is larger than 15 MB — choose a shorter clip."
      );
      return;
    }

    setVideoName(file.name);

    /*
     * Current backend /api/reports accepts the image upload.
     * We keep the video UI ready for the next backend update.
     */

    setError("");
  }

  // --------------------------------------------------
  // GPS LOCATION
  // --------------------------------------------------

  function useLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoords(
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );
      },
      () => {
        setError(
          "Couldn't get your location — please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  function reset() {
    setType(reportTypes[0]);

    setSeverity("Moderate");

    setStateId("");
    setDistrictId("");

    setPlace("");
    setDescription("");

    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoName("");

    setVideoName("");

    setCoords("");
  }

  // --------------------------------------------------
  // SUBMIT REAL REPORT TO BACKEND
  // --------------------------------------------------

  async function onSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    // ----------------------------------------------
    // Validation
    // ----------------------------------------------

    if (!stateId || !districtId) {
      setError(
        "Choose a state and district so responders know where to go."
      );
      return;
    }

    if (!coords) {
      setError(
        "Please use your current location before submitting the report."
      );
      return;
    }

    if (!description.trim() && !photoFile && !videoName) {
      setError(
        "Add a photo, video or a short description — at least one of the three."
      );
      return;
    }

    // ----------------------------------------------
    // Convert GPS coordinates
    // ----------------------------------------------

    const [latitudeString, longitudeString] = coords
      .split(",")
      .map((value) => value.trim());

    const latitude = Number(latitudeString);
    const longitude = Number(longitudeString);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError(
        "Invalid GPS coordinates. Please use your current location again."
      );
      return;
    }

    // ----------------------------------------------
    // Authentication check
    // ----------------------------------------------

   

    // ----------------------------------------------
    // Create multipart form data
    // ----------------------------------------------

    const formData = new FormData();

    formData.append("latitude", String(latitude));
    formData.append("longitude", String(longitude));

    formData.append(
      "description",
      description.trim()
    );

    formData.append(
      "severity",
      severityLevel[severity]
    );

    // Include image only when user selected one
    if (photoFile) {
      formData.append(
        "image",
        photoFile,
        photoFile.name
      );
    }

    // ----------------------------------------------
    // Send to LandSafe backend
    // ----------------------------------------------

    try {
      setSubmitting(true);

      const response = await api.post(
        "/api/reports",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      console.log(
        "✅ LandSafe report created:",
        result
      );

      // --------------------------------------------
      // Handle backend response
      // --------------------------------------------

      if (!result.success) {
        throw new Error(
          result.message || "Report submission failed."
        );
      }

      const reportData = result.data;

      // --------------------------------------------
      // Store locally for immediate UI feedback
      // --------------------------------------------

      const localReport = {
        id: reportData?.id || Date.now(),
        type,
        severity,
        severityLevel: severityLevel[severity],
        state: stateObj.name,
        district: districtId,
        place: place.trim(),
        description: description.trim(),
        photo: photoPreview,
        photoName,
        latitude,
        longitude,
        status: "synced",
        riskLevel: reportData?.risk_level,
        alertStatus: reportData?.alert_status,
        aiStatus: reportData?.ai_status,
        aiConfidence: reportData?.ai_confidence,
      };

      setSubmittedReports((previous) => [
        localReport,
        ...previous,
      ]);

      // --------------------------------------------
      // Notify application
      // --------------------------------------------

      addUserReport({
        ...localReport,
        severityLevel: severityLevel[severity],
      });

      // --------------------------------------------
      // Success
      // --------------------------------------------

      setSuccessMessage(
        "Report submitted successfully to LandSafe."
      );

      reset();
    } catch (err) {
      console.error(
        "❌ LandSafe report submission failed:",
        err.response?.data || err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (err.response?.status === 401) {
  setError(
    "Report submission was not authorized by the server."
  );
} else if (err.response?.status === 400) {
        setError(
          backendMessage ||
            "The report data was rejected by the server."
        );
      } else if (!err.response) {
        setError(
          "Cannot connect to the LandSafe backend. Make sure the backend is running on port 5000."
        );
      } else {
        setError(
          backendMessage ||
            "Something went wrong while submitting the report."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">

      {!navigator.onLine && (
        <Notice>
          <span className="inline-flex items-center gap-1.5 font-medium text-moderate">
            <WifiOffIcon size={13} />
            Offline —
          </span>{" "}
          Please reconnect to the internet before submitting
          your report.
        </Notice>
      )}

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-low/40 bg-low/10 px-3.5 py-2.5 text-sm font-medium text-low">
          <CheckIcon size={16} />
          {successMessage}
        </div>
      )}

      {/* REPORT FORM */}

      <Card
        title="Report an incident"
        subtitle="Photo, video or text — send whichever you have, or all three"
      >
        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >

          {/* TYPE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            >
              {reportTypes.map((t) => (
                <option key={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* STATE + DISTRICT */}

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                State
              </label>

              <select
                value={stateId}
                onChange={(e) => {
                  setStateId(e.target.value);
                  setDistrictId("");
                }}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">
                  Choose…
                </option>

                {places.states.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                District
              </label>

              <select
                value={districtId}
                onChange={(e) =>
                  setDistrictId(e.target.value)
                }
                disabled={!stateObj}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="">
                  Choose…
                </option>

                {stateObj?.districts.map(
                  ([id, name]) => (
                    <option
                      key={id}
                      value={id}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          {/* PLACE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Place / landmark{" "}
              <span className="normal-case text-muted">
                · optional
              </span>
            </label>

            <div className="flex gap-2">

              <input
                value={place}
                onChange={(e) =>
                  setPlace(e.target.value)
                }
                placeholder="Near the school, NH-13, etc."
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              />

              <Button
                type="button"
                variant="outline"
                onClick={useLocation}
                aria-label="Use current location"
              >
                <PinIcon size={16} />
              </Button>

            </div>

            {coords && (
              <p className="mt-1 text-[11px] text-muted">
                GPS: {coords}
              </p>
            )}
          </div>

          {/* SEVERITY */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Severity
            </label>

            <div className="flex flex-wrap gap-2">
              {severities.map((s) => (
                <Chip
                  key={s}
                  active={severity === s}
                  onClick={() =>
                    setSeverity(s)
                  }
                  type="button"
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <TextIcon size={13} />
              What did you see?
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              placeholder="Mud and boulders across the road near the school…"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          {/* PHOTO + VIDEO */}

          <div className="grid grid-cols-2 gap-3">

            <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-5 text-center text-muted hover:bg-surface2">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <CameraIcon size={20} />
              )}

              <span className="text-xs font-medium">
                {photoName || "Add a photo"}
              </span>

              <span className="text-[10px]">
                up to 1.5 MB
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPhoto}
              />

            </label>

            <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-5 text-center text-muted hover:bg-surface2">

              <VideoIcon size={20} />

              <span className="text-xs font-medium">
                {videoName || "Add a video"}
              </span>

              <span className="text-[10px]">
                up to 15 MB
              </span>

              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={onVideo}
              />

            </label>

          </div>

          {/* ERROR */}

          {error && (
            <p className="text-xs font-medium text-critical">
              {error}
            </p>
          )}

          {/* SUBMIT */}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting
              ? "Submitting report…"
              : "Submit report"}
          </Button>

        </form>
      </Card>

      {/* SUBMITTED REPORTS */}

      {submittedReports.length > 0 && (
        <Card
          title="Your reports"
          subtitle={`${submittedReports.length} submitted to LandSafe`}
        >
          <div className="flex flex-col gap-2.5">

            {submittedReports.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-line p-3"
              >

                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface2">

                  {r.photo ? (
                    <img
                      src={r.photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CameraIcon
                      size={16}
                      className="text-muted"
                    />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium">
                    {r.type} · {r.severity}
                  </p>

                  <p className="truncate text-[11px] text-muted">
                    {r.place
                      ? `${r.place}, `
                      : ""}
                    {r.state}
                  </p>

                  {r.riskLevel && (
                    <p className="text-[11px] text-muted">
                      Risk: {r.riskLevel}
                    </p>
                  )}

                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">

                  <span className="text-[11px] font-medium text-low">
                    ✓ Sent
                  </span>

                  {r.alertStatus === "sent" && (
                    <span className="text-[10px] text-moderate">
                      Authority alerted
                    </span>
                  )}

                </div>

              </div>
            ))}

          </div>
        </Card>
      )}

    </div>
  );
}