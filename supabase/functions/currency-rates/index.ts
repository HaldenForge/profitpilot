
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const SUPPORTED = ["GBP", "USD", "EUR"];

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    if (req.method !== "POST") {
      return Response.json(
        { success: false, error: "Only POST requests are supported." },
        { status: 405 }
      );
    }

    let payload: Record<string, unknown>;

    try {
      payload = await req.json();
    } catch {
      return Response.json(
        { success: false, error: "Invalid JSON request." },
        { status: 400 }
      );
    }

    const base =
      typeof payload.base === "string"
        ? payload.base.toUpperCase()
        : "EUR";

    if (!SUPPORTED.includes(base)) {
      return Response.json(
        { success: false, error: "Unsupported base currency." },
        { status: 400 }
      );
    }

    const quotes = SUPPORTED.filter(currency => currency !== base);

    try {
      const apiUrl =
        `https://api.frankfurter.dev/v2/rates?base=${base}&quotes=${quotes.join(",")}`;

      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Exchange-rate provider request failed.");
      }

      const rows = await response.json();

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("No exchange rates were returned.");
      }

      const rates: Record<string, number> = { [base]: 1 };
      let updatedAt = "";

      for (const row of rows) {
        if (
          typeof row.quote === "string" &&
          typeof row.rate === "number" &&
          Number.isFinite(row.rate) &&
          row.rate > 0
        ) {
          rates[row.quote] = row.rate;

          if (typeof row.date === "string" && row.date > updatedAt) {
            updatedAt = row.date;
          }
        }
      }

      if (Object.keys(rates).length !== SUPPORTED.length) {
        throw new Error("Some exchange rates are missing.");
      }

      return Response.json(
        {
          success: true,
          base,
          rates,
          updatedAt,
          source: "Frankfurter reference exchange rates",
          rateType: "reference",
        },
        {
          headers: {
            "Cache-Control": "public, max-age=3600",
          },
        }
      );
    } catch (error) {
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to retrieve exchange rates.",
        },
        { status: 502 }
      );
    }
  }),
};
