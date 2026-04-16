import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const country = await prisma.country.findMany();
    return NextResponse.json(country);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { countryId } = body;

    const states = await prisma.state.findMany({
      where: { countryId: Number(countryId) },
    });

    return NextResponse.json(states);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener states" },
      { status: 500 },
    );
  }
}
