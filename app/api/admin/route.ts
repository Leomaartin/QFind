import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso no autorizado. Se requieren privilegios de administrador." },
        { status: 403 }
      );
    }

    const services = await prisma.service.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error en /api/admin:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
