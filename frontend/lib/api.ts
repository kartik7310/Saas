const BASE_URL = typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api/v1");




export const
  api = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    // Read token from localStorage for Authorization header (works in production)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const defaultOptions: RequestInit = {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      // Also send cookies (works locally / same-domain)
      credentials: "include",
    };

    const response = await fetch(url, defaultOptions);

    // Try to parse as JSON, but handle HTML/Text errors gracefully
    const contentType = response.headers.get("content-type");
    let data: any = {};
    let rawText = "";

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      rawText = await response.text();
    }

    if (!response.ok) {
      if (data.message) {
        const errorDetail = data.error ? `: ${data.error}` : "";
        throw new Error(`${data.message}${errorDetail}`);
      }
      if (data.errors) {
        const labelMap: Record<string, string> = {
          expectedPrice: "Expected Price",
          startingPrice: "Starting Price",
          availableUnits: "Available Units",
          bookingAmount: "Booking Amount",
          carpetArea: "Carpet Area",
          maintenance: "Maintenance",
          propertyTitle: "Property Title",
          pricing: "Pricing Details",
          residential: "Residential Details",
          commercial: "Commercial Details",
          location: "Location Details"
        };
        const errorMsg = Object.entries(data.errors)
          .map(([field, msgs]: [string, any]) => {
            const label = labelMap[field] || field;
            return `${label}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`;
          })
          .join(" | ");
        throw new Error(errorMsg);
      }
      throw new Error(rawText || data.message || "Something went wrong");
    }

    return data;
  };
