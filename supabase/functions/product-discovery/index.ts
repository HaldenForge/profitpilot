
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const SUPPORTED_MARKETPLACES = [
  "Amazon",
  "eBay",
  "Etsy",
  "Shopify",
  "Google Search",
  "Google Shopping",
  "Walmart",
];

const SUPPORTED_COUNTRIES = [
  "GB",
  "US",
  "DE",
  "FR",
  "IT",
  "ES",
  "CA",
  "AU",
  "IN",
];

export default {
  fetch: withSupabase({ auth: "user" }, async (req, _ctx) => {
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

    const marketplace =
      typeof payload.marketplace === "string"
        ? payload.marketplace.trim()
        : "";

    const keyword =
      typeof payload.keyword === "string"
        ? payload.keyword.trim()
        : "";

    const targetCountry =
      typeof payload.targetCountry === "string"
        ? payload.targetCountry.trim().toUpperCase()
        : "GB";

    if (!SUPPORTED_MARKETPLACES.includes(marketplace)) {
      return Response.json(
        { success: false, error: "Please select a supported marketplace." },
        { status: 400 }
      );
    }

    if (!SUPPORTED_COUNTRIES.includes(targetCountry)) {
      return Response.json(
        { success: false, error: "Please select a supported target country." },
        { status: 400 }
      );
    }

    if (!keyword || keyword.length > 120) {
      return Response.json(
        {
          success: false,
          error: "Enter a keyword between 1 and 120 characters.",
        },
        { status: 400 }
      );
    }

    const requestedLimit =
      typeof payload.limit === "number" &&
      Number.isInteger(payload.limit)
        ? payload.limit
        : 10;

    const limit = Math.min(Math.max(requestedLimit, 1), 25);

    return Response.json({
      success: true,
      marketplace,
      targetCountry,
      keyword,
      limit,
      provider_connected: false,
      data_status: "unavailable",
      results: [],
      message:
        "Your search request is valid. A live marketplace data provider has not been connected yet, so no product results have been fetched.",
    });
  }),
};
