import { NextRequest, NextResponse } from "next/server";
import { mvpCities } from "@/data/mvpCatalog";
import { slugify } from "@/lib/utils/text";

export const dynamic = "force-dynamic";

type CitySuggestion = {
  label: string;
  value: string;
  placeId?: string;
  source: "google" | "fallback";
};

type GooglePlacesAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
    };
  }>;
};

function buildFallbackSuggestions(input: string): CitySuggestion[] {
  const normalizedInput = slugify(input);

  return mvpCities
    .filter((city) => {
      if (!normalizedInput) {
        return true;
      }

      return slugify(city.name).includes(normalizedInput);
    })
    .map((city) => ({
      label: city.name,
      value: city.slug,
      source: "fallback" as const,
    }));
}

function uniqueSuggestions(suggestions: CitySuggestion[]): CitySuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    if (seen.has(suggestion.value)) {
      return false;
    }

    seen.add(suggestion.value);
    return true;
  });
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input")?.trim() ?? "";
  const fallbackSuggestions = buildFallbackSuggestions(input);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (input.length < 2 || !apiKey) {
    return NextResponse.json({ suggestions: fallbackSuggestions });
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ["(cities)"],
        includedRegionCodes: ["AR"],
        languageCode: "es-419",
        regionCode: "AR",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: fallbackSuggestions });
    }

    const data = (await response.json()) as GooglePlacesAutocompleteResponse;

    const googleSuggestions =
      data.suggestions
        ?.map((item) => item.placePrediction)
        .filter((prediction): prediction is NonNullable<typeof prediction> =>
          Boolean(prediction?.text?.text)
        )
        .map((prediction) => {
          const label = prediction.text?.text ?? "";
          const matchingCity = mvpCities.find((city) =>
            slugify(label).includes(city.slug)
          );

          return {
            label,
            value: matchingCity?.slug ?? slugify(label),
            placeId: prediction.placeId,
            source: "google" as const,
          };
        }) ?? [];

    return NextResponse.json({
      suggestions: uniqueSuggestions([
        ...googleSuggestions,
        ...fallbackSuggestions,
      ]),
    });
  } catch {
    return NextResponse.json({ suggestions: fallbackSuggestions });
  }
}
