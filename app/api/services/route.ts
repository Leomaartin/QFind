import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, ...serviceData } = body;

    if (!userEmail) {
      return NextResponse.json(
        {
          error: "El correo del usuario es necesario para vincular el servicio",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos" },
        { status: 404 },
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
        userId: user.id,
        categoryId: Number(serviceData.categoryId),
        subcategoryId: Number(serviceData.subcategoryId),

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
      { status: 500 },
    );
  }
}

// MOSTRAR (LISTAR o BUSCAR por email)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email },
        include: { service: true },
      });
      return NextResponse.json(user?.service || null);
    }

    const services = await prisma.service.findMany();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 },
    );
  }
}

// ACTUALIZAR (PUT)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userEmail, ...updateData } = body;

    let serviceId = id;

    if (!serviceId && userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { service: true },
      });
      serviceId = user?.service?.id;
    }

    if (!serviceId) {
      return NextResponse.json(
        {
          error:
            "Se requiere un ID de servicio o correo de usuario válido para actualizar",
        },
        { status: 400 },
      );
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: updateData.name,
        label: updateData.label,
        description: updateData.description,
        phone: updateData.phone,
        instagram: updateData.instagram,
        email: updateData.email,
        image: updateData.image,
        active: updateData.active,
        validated: updateData.validated,
        paid: updateData.paid,
        categoryId: Number(updateData.categoryId),
        subcategoryId: Number(updateData.subcategoryId),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 },
    );
  }
}
