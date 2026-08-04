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
        countryId: serviceData.countryId ? Number(serviceData.countryId) : null,
        stateId: serviceData.stateId ? Number(serviceData.stateId) : null,
        cityId: serviceData.cityId ? Number(serviceData.cityId) : null,

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
        include: { 
          service: {
            include: {
              plans: {
                include: { planType: true },
                orderBy: { endDate: 'desc' }
              }
            }
          } 
        },
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

    // Construir el objeto de actualización dinámicamente para no sobreescribir
    // campos que no vengan en el body (ej: categoryId, subcategoryId, stateId, etc.)
    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.label !== undefined) data.label = updateData.label;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.phone !== undefined) data.phone = updateData.phone;
    if (updateData.instagram !== undefined) data.instagram = updateData.instagram;
    if (updateData.email !== undefined) data.email = updateData.email;
    if (updateData.image !== undefined) data.image = updateData.image;
    if (updateData.active !== undefined) data.active = updateData.active;
    if (updateData.validated !== undefined) data.validated = updateData.validated;
    if (updateData.paid !== undefined) data.paid = updateData.paid;

    // Estos campos solo se actualizan si vienen explícitamente en el body
    if (updateData.categoryId !== undefined)
      data.categoryId = Number(updateData.categoryId);
    if (updateData.subcategoryId !== undefined)
      data.subcategoryId = Number(updateData.subcategoryId);
    if (updateData.countryId !== undefined)
      data.countryId = updateData.countryId ? Number(updateData.countryId) : null;
    if (updateData.stateId !== undefined)
      data.stateId = updateData.stateId ? Number(updateData.stateId) : null;
    if (updateData.cityId !== undefined)
      data.cityId = updateData.cityId ? Number(updateData.cityId) : null;

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data,
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
