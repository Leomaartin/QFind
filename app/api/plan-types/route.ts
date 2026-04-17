import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const planTypes = await prisma.planType.findMany();
    return NextResponse.json(planTypes);
  } catch (error: any) {
    console.error("Error fetching PlanTypes:", error.message);
    return NextResponse.json(
      { error: "Error interno al obtener los tipos de planes" },
      { status: 500 }
    );
  }
}
