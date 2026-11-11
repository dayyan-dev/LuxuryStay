import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Helper: convert date to "YYYY-MM-DD" string (local timezone safe)
const toDateStr = (d) => {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * AvailabilityCalendar
 * Props:
 *  - roomId: Room ID to check real booked date ranges
 *  - checkInDate / checkOutDate: "YYYY-MM-DD" strings
 *  - onChange: (checkInDate, checkOutDate) => void
 *  - onConflictChange: (hasConflict) => void
 */
export default function AvailabilityCalendar({
  roomId,
  checkInDate,
  checkOutDate,
  onChange,
  onConflictChange,
}) {
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => {
    if (checkInDate) {
      const d = new Date(checkInDate);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date();
  });
  const [selectingCheckout, setSelectingCheckout] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/bookings/room/${roomId}/booked-dates`);
        setBookedRanges(res.data?.bookedRanges || []);
      } catch (err) {
        console.warn("Availability fetch notice:", err.message);
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchAvailability();
  }, [roomId]);

  // Sync viewDate if checkInDate changes to another month
  useEffect(() => {
    if (checkInDate) {
      const d = new Date(checkInDate);
      if (!isNaN(d.getTime())) {
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [checkInDate]);

  const isDateBooked = (dateObj) => {
    const dateStr = toDateStr(dateObj);
    return bookedRanges.some((range) => {
      const inDate = toDateStr(new Date(range.checkIn));
      const outDate = toDateStr(new Date(range.checkOut));
      // Checkout day itself is bookable for the incoming guest
      return dateStr >= inDate && dateStr < outDate;
    });
  };

  const isPastDate = (dateObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateObj);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  // Check if any booked dates are in the selected range
  const isRangeBlocked = (fromStr, toStr) => {
    if (!fromStr || !toStr) return false;
    return bookedRanges.some((range) => {
      const inDate = toDateStr(new Date(range.checkIn));
      const outDate = toDateStr(new Date(range.checkOut));
      return fromStr < outDate && toStr > inDate;
    });
  };

  // Notify parent of range conflict
  useEffect(() => {
    if (onConflictChange) {
      const conflict = isRangeBlocked(checkInDate, checkOutDate);
      onConflictChange(conflict);
    }
  }, [checkInDate, checkOutDate, bookedRanges, onConflictChange]);

  const handleDayClick = (dateObj) => {
    if (isPastDate(dateObj) || isDateBooked(dateObj)) return;
    const dateStr = toDateStr(dateObj);

    if (!selectingCheckout || !checkInDate) {
      // Step 1: Set check-in date
      // Automatically suggest next day for check-out as minimum 1-night stay
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = toDateStr(nextDay);

      // Check if next day is booked
      if (!isDateBooked(nextDay)) {
        onChange(dateStr, nextDayStr);
      } else {
        onChange(dateStr, "");
      }
      setSelectingCheckout(true);
    } else {
      // Step 2: Set check-out date
      if (dateStr <= checkInDate) {
        // If clicked date is before or equal to check-in, make it the new check-in
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        onChange(dateStr, toDateStr(nextDay));
        setSelectingCheckout(true);
        return;
      }

      if (isRangeBlocked(checkInDate, dateStr)) {
        // Blocked dates in between — reset checkin to this day
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        onChange(dateStr, toDateStr(nextDay));
        setSelectingCheckout(true);
        return;
      }

      onChange(checkInDate, dateStr);
      setSelectingCheckout(false);
    }
  };

  const goToPrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return cells;
  };

  const cells = renderMonth();
  const today = new Date();
  const minNavDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoPrev = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1) > minNavDate;
  const hasRangeConflict = checkInDate && checkOutDate && isRangeBlocked(checkInDate, checkOutDate);

  return (
    <div
      style={{
        border: "1px solid var(--theme-border, #E2E8F0)",
        borderRadius: 10,
        padding: 16,
        background: "#FFFFFF",
      }}
    >
      {/* Calendar Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          aria-label="Previous Month"
          style={{
            border: "1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))",
            background: canGoPrev ? "var(--theme-surface-subtle, #F1F5F9)" : "#F3F4F6",
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            cursor: canGoPrev ? "pointer" : "not-allowed",
            color: canGoPrev ? "var(--theme-text-dark, #0F172A)" : "#CCCCCC",
            transition: "all 0.2s ease",
          }}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <strong
          style={{
            fontSize: 14,
            fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
            color: "var(--theme-text-dark, #0F172A)",
            letterSpacing: "0.04em",
          }}
        >
          {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
        </strong>

        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next Month"
          style={{
            border: "1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))",
            background: "var(--theme-surface-subtle, #F1F5F9)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            cursor: "pointer",
            color: "var(--theme-text-dark, #0F172A)",
            transition: "all 0.2s ease",
          }}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted py-3" style={{ fontSize: 13 }}>
          <i className="fa-solid fa-circle-notch fa-spin me-2" style={{ color: "var(--theme-primary, #1B365D)" }}></i>
          Checking suite availability...
        </div>
      ) : (
        <>
          {/* Weekday headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: 6,
            }}
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#9C9A91",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((dateObj, idx) => {
              if (!dateObj) return <div key={idx}></div>;

              const dateStr = toDateStr(dateObj);
              const booked = isDateBooked(dateObj);
              const past = isPastDate(dateObj);
              const isCheckIn = dateStr === checkInDate;
              const isCheckOut = dateStr === checkOutDate;
              const inRange =
                checkInDate &&
                checkOutDate &&
                dateStr > checkInDate &&
                dateStr < checkOutDate;

              let bg = "#FFFFFF";
              let color = "var(--theme-text-dark, #0F172A)";
              let cursor = "pointer";
              let border = "1px solid transparent";

              if (past || booked) {
                bg = "var(--theme-surface-subtle, #F1F5F9)";
                color = "#BDB9B0";
                cursor = "not-allowed";
              }
              if (inRange) {
                bg = "var(--theme-primary-soft, rgba(27, 54, 93, 0.16))";
                color = "var(--theme-text-dark, #0F172A)";
              }
              if (isCheckIn || isCheckOut) {
                bg = "var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))";
                color = "#FFFFFF";
                border = "1px solid var(--theme-primary-hover, #122642)";
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(dateObj)}
                  title={
                    past
                      ? "Past Date"
                      : booked
                      ? "Room already reserved"
                      : isCheckIn
                      ? "Check-In Date"
                      : isCheckOut
                      ? "Check-Out Date"
                      : "Available for booking"
                  }
                  style={{
                    textAlign: "center",
                    padding: "7px 0",
                    borderRadius: 6,
                    fontSize: 12.5,
                    background: bg,
                    color,
                    cursor,
                    border,
                    fontWeight: isCheckIn || isCheckOut ? 700 : inRange ? 600 : 400,
                    textDecoration: booked && !past ? "line-through" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {dateObj.getDate()}
                </div>
              );
            })}
          </div>

          {/* Conflict Warning if selected range overlaps an existing booking */}
          {hasRangeConflict && (
            <div
              className="alert alert-danger p-2 mt-3 mb-0 d-flex align-items-center gap-2"
              style={{ fontSize: 12, borderRadius: 6 }}
            >
              <i className="fa-solid fa-triangle-exclamation text-danger"></i>
              <span>This suite is already reserved during parts of your selected dates. Please adjust your stay.</span>
            </div>
          )}

          {/* Calendar Legend */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              fontSize: 11,
              color: "var(--theme-text-secondary, #475569)",
              flexWrap: "wrap",
            }}
          >
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: "var(--theme-surface-subtle, #F1F5F9)",
                  border: "1px solid var(--theme-border, #E2E8F0)",
                  borderRadius: 3,
                }}
              ></span>
              Unavailable
            </span>
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: "var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))",
                  borderRadius: 3,
                }}
              ></span>
              Selected Stay
            </span>
          </div>

          <p style={{ fontSize: 11.5, color: "#8E8B82", marginTop: 8, marginBottom: 0 }}>
            {!checkInDate
              ? "Click any available date to set Check-In."
              : !checkOutDate
              ? "Now click your Check-Out date."
              : `${checkInDate} to ${checkOutDate}`}
          </p>
        </>
      )}
    </div>
  );
}
