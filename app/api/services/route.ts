import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, ...serviceData } = body;

    const targetEmail =
      userEmail ||
      serviceData.email ||
      `service-${Date.now()}@qfind.local`;

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          google_id: targetEmail,
          nombre: serviceData.name || targetEmail.split("@")[0],
          foto: serviceData.image || null,
        },
      });
    } else {
      const existingService = await prisma.service.findUnique({
        where: { userId: user.id },
      });
      if (existingService) {
        const rand = Math.random().toString(36).substring(2, 7);
        const altEmail = `${targetEmail.split("@")[0]}+${rand}@qfind.local`;
        user = await prisma.user.create({
          data: {
            email: altEmail,
            google_id: altEmail,
            nombre: serviceData.name || user.nombre,
            foto: serviceData.image || user.foto,
          },
        });
      }
    }

    const isActive =
      serviceData.active !== undefined ? Boolean(serviceData.active) : true;
    const isValidated =
      serviceData.validated !== undefined ? Boolean(serviceData.validated) : true;
    const isPaid =
      serviceData.paid !== undefined ? Boolean(serviceData.paid) : false;

    const service = await prisma.service.create({
      data: {
        name: serviceData.name,
        label: serviceData.label || serviceData.name,
        description: serviceData.description || "",
        phone: serviceData.phone || "",
        instagram: serviceData.instagram || "",
        email: serviceData.email || targetEmail,
        image: serviceData.image || "",
        userId: user.id,
        categoryId: serviceData.categoryId ? Number(serviceData.categoryId) : null,
        subcategoryId: serviceData.subcategoryId
          ? Number(serviceData.subcategoryId)
          : null,
        countryId: serviceData.countryId ? Number(serviceData.countryId) : null,
        stateId: serviceData.stateId ? Number(serviceData.stateId) : null,
        cityId: serviceData.cityId ? Number(serviceData.cityId) : null,

        active: isActive,
        validated: isValidated,
        paid: isPaid,
      },
    });

    if (isPaid) {
      const planType = await prisma.planType.findFirst();
      if (planType) {
        const now = new Date();
        const duration = planType.duration || 30;
        const endDate = new Date(
          now.getTime() + duration * 24 * 60 * 60 * 1000
        );
        await prisma.plan.create({
          data: {
            startDate: now,
            endDate,
            paymentStatus: true,
            planTypeId: planType.id,
            serviceId: service.id,
          },
        });
      }
    }

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

    const takeParam = searchParams.get("take") || searchParams.get("limit");
    const take = takeParam ? Number(takeParam) : 500;

    const services = await prisma.service.findMany({
      take: take > 0 ? take : 500,
      include: {
        plans: {
          include: { planType: true },
          orderBy: { endDate: "desc" },
        },
      },
      orderBy: { id: "desc" },
    });
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

    let serviceId = id ? Number(id) : null;

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

    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.label !== undefined) data.label = updateData.label;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.phone !== undefined) data.phone = updateData.phone;
    if (updateData.instagram !== undefined) data.instagram = updateData.instagram;
    if (updateData.email !== undefined) data.email = updateData.email;
    if (updateData.image !== undefined) data.image = updateData.image;
    if (updateData.active !== undefined) data.active = Boolean(updateData.active);
    if (updateData.validated !== undefined) data.validated = Boolean(updateData.validated);
    if (updateData.paid !== undefined) data.paid = Boolean(updateData.paid);

    if (updateData.categoryId !== undefined)
      data.categoryId = updateData.categoryId ? Number(updateData.categoryId) : null;
    if (updateData.subcategoryId !== undefined)
      data.subcategoryId = updateData.subcategoryId ? Number(updateData.subcategoryId) : null;
    if (updateData.countryId !== undefined)
      data.countryId = updateData.countryId ? Number(updateData.countryId) : null;
    if (updateData.stateId !== undefined)
      data.stateId = updateData.stateId ? Number(updateData.stateId) : null;
    if (updateData.cityId !== undefined)
      data.cityId = updateData.cityId ? Number(updateData.cityId) : null;

    if (updateData.planTypeId) {
      data.paid = true;
    }

    await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    if (updateData.planTypeId) {
      const planTypeId = Number(updateData.planTypeId);
      const planType = await prisma.planType.findUnique({
        where: { id: planTypeId },
      });
      if (planType) {
        const now = new Date();
        const duration = planType.duration || 30;
        const endDate = new Date(
          now.getTime() + duration * 24 * 60 * 60 * 1000
        );

        await prisma.plan.deleteMany({
          where: { serviceId },
        });

        await prisma.plan.create({
          data: {
            startDate: now,
            endDate,
            paymentStatus: true,
            planTypeId: planType.id,
            serviceId,
          },
        });
      }
    } else if (updateData.paid === true) {
      const existingPlan = await prisma.plan.findFirst({
        where: { serviceId },
        orderBy: { endDate: "desc" },
      });
      if (!existingPlan) {
        const planType = await prisma.planType.findFirst();
        if (planType) {
          const now = new Date();
          const duration = planType.duration || 30;
          const endDate = new Date(
            now.getTime() + duration * 24 * 60 * 60 * 1000
          );
          await prisma.plan.create({
            data: {
              startDate: now,
              endDate,
              paymentStatus: true,
              planTypeId: planType.id,
              serviceId,
            },
          });
        }
      } else {
        const isExpired = new Date(existingPlan.endDate).getTime() < Date.now();
        const now = new Date();
        const planType = await prisma.planType.findUnique({
          where: { id: existingPlan.planTypeId },
        });
        const duration = planType?.duration || 30;
        const endDate = isExpired
          ? new Date(now.getTime() + duration * 24 * 60 * 60 * 1000)
          : existingPlan.endDate;

        await prisma.plan.update({
          where: { id: existingPlan.id },
          data: {
            paymentStatus: true,
            endDate,
            startDate: isExpired ? now : existingPlan.startDate,
          },
        });
      }
    } else if (updateData.paid === false) {
      await prisma.plan.updateMany({
        where: { serviceId },
        data: { paymentStatus: false },
      });
    }

    const finalService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        plans: {
          include: { planType: true },
          orderBy: { endDate: "desc" },
        },
      },
    });

    return NextResponse.json(finalService);
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 },
    );
  }
}
