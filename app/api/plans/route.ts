import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, planTypeId } = body;

    if (!serviceId || !planTypeId) {
      return NextResponse.json(
        { error: "serviceId y planTypeId son requeridos" },
        { status: 400 }
      );
    }

    const planType = await prisma.planType.findUnique({
      where: { id: parseInt(planTypeId.toString()) },
    });

    if (!planType) {
      return NextResponse.json(
        { error: "El tipo de plan seleccionado no existe" },
        { status: 404 }
      );
    }

    const activePlan = await prisma.plan.findFirst({
      where: {
        serviceId: parseInt(serviceId.toString()),
        endDate: { gt: new Date() },
      },
    });

    if (activePlan) {
      return NextResponse.json(
        { error: "Este servicio ya tiene un plan activo en curso." },
        { status: 400 }
      );
    }

    const startDate = new Date();
    // Assuming duration is in days
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + planType.duration);

    // Create the plan
    const newPlan = await prisma.plan.create({
      data: {
        startDate,
        endDate,
        paymentStatus: false, // Default to false pending payment
        serviceId: parseInt(serviceId.toString()),
        planTypeId: planType.id,
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating plan:", error.message);
    return NextResponse.json(
      { error: "Error interno al crear el plan" },
      { status: 500 }
    );
  }
}
