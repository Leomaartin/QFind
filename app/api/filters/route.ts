import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const category = await prisma.category.findMany();
    return NextResponse.json(category);
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
    const { id } = body;

    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: Number(id) },
    });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al obtener subcategorías" },
      { status: 500 },
    );
  }
}
