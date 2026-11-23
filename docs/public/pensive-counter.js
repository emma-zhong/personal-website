/*
 * Pensive lateness scraper
 *
 * Usage:
 *   1. Open the Pensive course's Assignments page while logged in.
 *   2. Open Chrome DevTools (Option+Command+I), select Console, paste this
 *      entire file, and press Enter.
 *   3. Wait for "Done". The script prints a table and downloads
 *      pensive-lateness.csv.
 *
 * "Days late" is max(0, ceil((submission time - due time) / 24 hours)).
 * The script uses the timestamp of the submission linked from the assignment
 * list (normally the latest/current submission).
 */

(async () => {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const COURSE_PATH_RE = /\/student\/classes\/[^/]+\/my-assignments\/?$/;

  // Pensive's analytics requests can produce many ERR_BLOCKED_BY_CLIENT lines
  // when an ad/privacy blocker is active. Page JavaScript cannot change the
  // DevTools filter, so clear that noise before showing the final report.
  const CLEAR_CONSOLE_NOISE = true;

  const isPensive = /^(?:www\.)?pensive\.com$/i.test(location.hostname);
  if (!isPensive || !COURSE_PATH_RE.test(location.pathname)) {
    throw new Error(
      "Open the course's main Pensive Assignments page before running this script."
    );
  }

  if (CLEAR_CONSOLE_NOISE) console.clear();

  const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

  function displayedDueZone() {
    const heading = [...document.querySelectorAll("th, [role='columnheader']")]
      .map((element) => normalize(element.textContent))
      .find((text) => /^Due\b/i.test(text));
    return heading?.match(/\((PST|PDT)\)/i)?.[1]?.toUpperCase() || "PST";
  }

  function assignmentName(link) {
    const label = normalize(link.getAttribute("aria-label"));
    const text = normalize(link.textContent);
    return (label || text).replace(
      /^Open\s+(?:(?:programming\s+)?assignment|exam)\s+/i,
      ""
    );
  }

  function assignmentType(row, url) {
    const text = normalize(row.cells?.[0]?.innerText || row.innerText);
    for (const type of ["Programming", "Homework", "Exam"]) {
      if (text.includes(type)) return type;
    }
    if (url.includes("/programming/")) return "Programming";
    if (url.includes("/exams/")) return "Exam";
    return "Assignment";
  }

  function dueText(row) {
    const text = normalize(row.cells?.[row.cells.length - 1]?.innerText || row.innerText);
    const match = text.match(
      /(?:Due\s+)?([A-Z][a-z]{2}\s+\d{1,2}\s+\d{1,2}:\d{2}\s+[AP]M)/i
    );
    return match?.[1] || "";
  }

  function collectAssignments() {
    const seen = new Set();
    const assignments = [];

    for (const row of document.querySelectorAll("table tr")) {
      const link = row.querySelector('a[href*="/submissions/"]');
      if (!link) continue;

      const url = new URL(link.getAttribute("href"), location.href).href;
      if (seen.has(url)) continue;
      seen.add(url);

      const due = dueText(row);
      if (!due) {
        console.warn("Could not find a due date; keeping the row as an error:", row);
      }

      assignments.push({
        assignment: assignmentName(link),
        type: assignmentType(row, url),
        status: normalize(row.cells?.[1]?.innerText).split(" · ")[0],
        dueText: due,
        url,
      });
    }

    return assignments;
  }

  function parseSubmissionTimestamp(text) {
    const match = normalize(text).match(
      /Submitted\s+(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s+([AP]M)\s+(PST|PDT)/i
    );
    if (!match) return null;

    const [, month, day, year, rawHour, minute, second, meridiem, zone] = match;
    let hour = Number(rawHour) % 12;
    if (meridiem.toUpperCase() === "PM") hour += 12;

    // Convert the explicit PST/PDT timestamp to UTC without relying on the
    // computer's local time zone.
    const offsetHours = zone.toUpperCase() === "PDT" ? 7 : 8;
    const epochMs =
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        hour,
        Number(minute),
        Number(second)
      ) +
      offsetHours * 60 * 60 * 1000;

    return {
      date: new Date(epochMs),
      display: `${month}/${day}/${year} ${rawHour}:${minute}:${second} ${meridiem.toUpperCase()} ${zone.toUpperCase()}`,
    };
  }

  function parseDueDate(value, submissionDate, zone) {
    const match = normalize(value).match(
      /^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{1,2}):(\d{2})\s+([AP]M)$/i
    );
    if (!match) return null;

    const [, monthName, day, rawHour, minute, meridiem] = match;
    const monthIndex = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec",
    ].indexOf(monthName.toLowerCase());
    if (monthIndex < 0) return null;

    let hour = Number(rawHour) % 12;
    if (meridiem.toUpperCase() === "PM") hour += 12;

    // Pensive omits the year in the assignment list. Try the submission year
    // and its neighbors, then choose the due date nearest the submission.
    const submissionYear = submissionDate.getUTCFullYear();
    const offsetHours = zone === "PDT" ? 7 : 8;
    const candidates = [submissionYear - 1, submissionYear, submissionYear + 1].map(
      (year) => ({
        year,
        // Use the zone printed in Pensive's Due column. The current page says
        // "Due (PST)" even for assignments earlier in the semester.
        date: new Date(
          Date.UTC(year, monthIndex, Number(day), hour, Number(minute)) +
            offsetHours * 60 * 60 * 1000
        ),
      })
    );

    candidates.sort(
      (a, b) =>
        Math.abs(a.date.getTime() - submissionDate.getTime()) -
        Math.abs(b.date.getTime() - submissionDate.getTime())
    );
    return candidates[0];
  }

  async function timestampFromFetch(url) {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    return parseSubmissionTimestamp(parsed.body?.textContent || html);
  }

  async function timestampFromHiddenFrame(url) {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    Object.assign(frame.style, {
      position: "fixed",
      width: "1px",
      height: "1px",
      left: "-10000px",
      top: "-10000px",
      border: "0",
    });
    document.body.appendChild(frame);

    try {
      frame.src = url;
      const deadline = Date.now() + 20_000;
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        try {
          const text = frame.contentDocument?.body?.innerText || "";
          const timestamp = parseSubmissionTimestamp(text);
          if (timestamp) return timestamp;
        } catch {
          // Keep polling until the same-origin page finishes navigating.
        }
      }
      return null;
    } finally {
      frame.remove();
    }
  }

  async function getSubmissionTimestamp(url) {
    try {
      const timestamp = await timestampFromFetch(url);
      if (timestamp) return timestamp;
    } catch (error) {
      console.warn("Fetch did not expose the timestamp; trying a hidden page:", error);
    }
    return timestampFromHiddenFrame(url);
  }

  function csvCell(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function downloadCsv(rows) {
    const columns = [
      "assignment",
      "type",
      "status",
      "due_pacific",
      "submitted_pacific",
      "days_late_rounded_up",
      "hours_late",
      "url",
      "error",
    ];
    const csv = [
      columns.map(csvCell).join(","),
      ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
    ].join("\n");

    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "pensive-lateness.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
  }

  const assignments = collectAssignments();
  const dueZone = displayedDueZone();
  if (!assignments.length) {
    throw new Error(
      "No submitted assignments were found. Make sure the assignment table has loaded."
    );
  }

  console.log(`Found ${assignments.length} submitted/graded assignments.`);
  const results = [];

  for (let index = 0; index < assignments.length; index += 1) {
    const item = assignments[index];
    console.log(`[${index + 1}/${assignments.length}] ${item.assignment}`);

    try {
      const submitted = await getSubmissionTimestamp(item.url);
      if (!submitted) throw new Error("Submission timestamp not found");

      const due = parseDueDate(item.dueText, submitted.date, dueZone);
      if (!due) throw new Error(`Due date not understood: ${item.dueText || "missing"}`);

      const lateMs = Math.max(0, submitted.date.getTime() - due.date.getTime());
      results.push({
        ...item,
        due_pacific: `${item.dueText} ${due.year} ${dueZone}`,
        submitted_pacific: submitted.display,
        days_late_rounded_up: Math.ceil(lateMs / DAY_MS),
        hours_late: (lateMs / (60 * 60 * 1000)).toFixed(2),
        error: "",
      });
    } catch (error) {
      results.push({
        ...item,
        due_pacific: item.dueText,
        submitted_pacific: "",
        days_late_rounded_up: "",
        hours_late: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (CLEAR_CONSOLE_NOISE) {
    // Let any requests started by the final hidden frame settle before clearing.
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    console.clear();
  }

  console.table(
    results.map((row) => ({
      Assignment: row.assignment,
      Type: row.type,
      Due: row.due_pacific,
      Submitted: row.submitted_pacific,
      "Days late (rounded up)": row.days_late_rounded_up,
      Error: row.error,
    }))
  );
  downloadCsv(results);

  const failures = results.filter((row) => row.error);
  console.log(
    `Done: ${results.length - failures.length}/${results.length} processed successfully. ` +
      "Downloaded pensive-lateness.csv."
  );
  if (failures.length) console.warn("Rows needing attention:", failures);
})();
