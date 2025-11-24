export const formatDate = (dateString) => {
  try {
    // Check if dateString is valid
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return "---";
    }

    let date;

    // Handle different date formats
    if (typeof dateString === "string" && dateString.includes("T")) {
      date = new Date(dateString);
    } else if (typeof dateString === "string") {
      // Try parsing as timestamp
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        date = new Date(timestamp);
      } else {
        return "---";
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return "---";
    }

    // Final validation
    if (!date || isNaN(date.getTime())) {
      return "---";
    }

    // Convert to Persian date format
    const formatter = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return formatter.format(date);
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "---";
  }
};
