import { useState, useMemo } from "preact/hooks";
import "./app.css";

interface AttendanceData {
  name: string;
  classroom: string;
}

export function App() {
  const [name, setName] = useState("");
  const [storedName, setStoredName] = useState<string | null>(() => {
    return localStorage.getItem("attendanceName");
  });
  const classroom = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("room");
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const submitAttendance = async (nameToSubmit: string) => {
    const trimmedName = nameToSubmit.trim();
    if (!trimmedName || !classroom) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Store name in localStorage
      localStorage.setItem("attendanceName", trimmedName);

      // Prepare payload for API call
      const payload: AttendanceData = {
        name: trimmedName,
        classroom: classroom,
      };

      // Make POST request to API (replace with your actual endpoint)
      const response = await fetch(import.meta.env.VITE_API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setStoredName(trimmedName);
        setName("");
      } else {
        throw new Error("Failed to submit attendance");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await submitAttendance(name);
  };

  const handleClearStorage = () => {
    localStorage.removeItem("attendanceName");
    setStoredName(null);
    setSubmitStatus(null);
  };

  const isFormValid = name.trim().length > 0 && name.trim().includes(" ");

  if (!classroom) {
    return (
      <div className="container">
        <div className="card">
          <h1>Attendance System</h1>
          <p className="error">
            No classroom specified. Please scan a valid QR code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Attendance</h1>
        <p className="classroom">Room: {classroom}</p>

        {storedName && submitStatus !== "success" ? (
          // Returning user view
          <div className="returning-user">
            <p className="welcome">
              Welcome back, <strong>{storedName}</strong>!
            </p>
            <button
              type="button"
              onClick={() => submitAttendance(storedName)}
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </button>
            <button
              type="button"
              onClick={handleClearStorage}
              className="secondary-button"
              style={{ marginTop: "0.5rem" }}
            >
              Not you?
            </button>

            {submitStatus === "error" && (
              <p className="error">
                Failed to record attendance. Please try again.
              </p>
            )}
          </div>
        ) : submitStatus === "success" ? (
          // Success view for both new and returning users
          <div className="success-view">
            <p className="success">Attendance recorded successfully!</p>
            <p className="subtitle">Thank you for checking in!</p>
            <button
              type="button"
              onClick={handleClearStorage}
              className="secondary-button"
            >
              Not you?
            </button>
          </div>
        ) : (
          // New user or cleared storage view
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                id="name"
                type="text"
                value={name}
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                placeholder="Enter your first and last name"
                disabled={isSubmitting}
                className="name-input"
              />
              {name.trim() && !name.trim().includes(" ") && (
                <p className="validation-hint">
                  Please enter both first and last name
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </button>

            {submitStatus === "error" && (
              <p className="error">
                Failed to record attendance. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
