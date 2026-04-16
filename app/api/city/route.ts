import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { stateId } = await req.json();

  const cities = await prisma.city.findMany({
    where: { stateId: Number(stateId) },
  });

  return NextResponse.json(cities);
}
