import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, ...serviceData } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "El correo del usuario es necesario para vincular el servicio" },
        { status: 400 }
      );
    }

    // Buscar al usuario por email para obtener su ID
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: serviceData.name,
        label: serviceData.label,
        description: serviceData.description,
        phone: serviceData.phone,
        instagram: serviceData.instagram,
        email: serviceData.email,
        image: serviceData.image,
        userId: user.id, // Vincular usando el ID encontrado

        active: serviceData.active || false,
        validated: serviceData.validated || false,
        paid: serviceData.paid || false,
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

// MOSTRAR (LISTAR o BUSCAR por email)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      // Intentamos buscar por el email del usuario vinculado
      const user = await prisma.user.findUnique({
        where: { email: email },
        include: { service: true }
      });
      return NextResponse.json(user?.service || null);
    }

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

// ACTUALIZAR (PUT)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, ...updateData } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "El correo del usuario es necesario para actualizar el servicio" },
        { status: 400 }
      );
    }

    // Buscar al usuario
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { service: true }
    });

    if (!user || !user.service) {
      return NextResponse.json(
        { error: "No se encontró un servicio para este usuario" },
        { status: 404 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id: user.service.id },
      data: {
        name: updateData.name,
        label: updateData.label,
        description: updateData.description,
        phone: updateData.phone,
        instagram: updateData.instagram,
        email: updateData.email,
        image: updateData.image,
        // No cambiamos active/paid aquí a menos que sea necesario
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 }
    );
  }
}