import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const service = await prisma.service.create({
      data: {
        name: body.name,
        label: body.label,
        description: body.description,
        phone: body.phone,
        instagram: body.instagram,
        email: body.email,
        image: body.image,

        active: body.active,
        validated: body.validated,
        paid: body.paid,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error creando servicio:", error);
    return NextResponse.json(
      { error: "Error al crear servicio" },
      { status: 500 }
    );
  }
}
//MOSTRAR (LISTAR)
export async function GET() {
  try {
    const services = await prisma.service.findMany();

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    );
  }
}