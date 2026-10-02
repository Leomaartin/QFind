const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const zaratePlaces = [
  {
    name: "Luna Studio Hair",
    label: "Peluquería & Balayage",
    description: "Justa Lima 342, Zárate - Balayage, coloración y peinados premium",
    phone: "+54 9 3487 55-4433",
    instagram: "lunastudiohair",
    email: "luna.studio.zarate@gmail.com",
    google_id: "seed_luna_zarate",
    userName: "Luna Studio Zarate",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    categoryId: 1, // Beauty & Aesthetics
    subcategoryId: 1, // Hair Salons
    planTypeId: 4, // Anual
  },
  {
    name: "Barbería La Central Zárate",
    label: "Barbería Tradicional & Fade",
    description: "San Martín 184, Zárate - Cortes clásicos, degradados y perfilado de barba",
    phone: "+54 9 3487 49-3021",
    instagram: "barberialacentral.zarate",
    email: "barberia.central.zarate@gmail.com",
    google_id: "seed_barberia_central_zarate",
    userName: "La Central Barbería",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    categoryId: 1, // Beauty & Aesthetics
    subcategoryId: 7, // Barber Shops
    planTypeId: 1, // Mensual
  },
  {
    name: "Glow Estética & Spa Zárate",
    label: "Clínica Estética y Cuidado Facial",
    description: "Ituzaingó 210, Zárate - Tratamientos faciales, corporales y masajes descontracturantes",
    phone: "+54 9 3487 52-0091",
    instagram: "glowesteticazarate",
    email: "glow.estetica.zarate@gmail.com",
    google_id: "seed_glow_zarate",
    userName: "Glow Estética Zárate",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    categoryId: 1, // Beauty & Aesthetics
    subcategoryId: 3, // Aesthetic Clinics
    planTypeId: 2, // Trimestral
  },
  {
    name: "Zárate Detailing Studio",
    label: "Detailing y Tratamientos Cerámicos",
    description: "Av. Lavalle 850, Zárate - Pulido, acrílicos y cerámicos de alta gama",
    phone: "+54 9 3487 62-1188",
    instagram: "zaratedetailing",
    email: "zarate.detailing@gmail.com",
    google_id: "seed_detailing_zarate",
    userName: "Zárate Detailing",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80",
    categoryId: 2, // Automotive
    subcategoryId: 9, // Car Detailing
    planTypeId: 4, // Anual
  },
  {
    name: "Mecánica Zárate Motor Sport",
    label: "Taller Mecánico e Inyección Electrónica",
    description: "Hipólito Yrigoyen 1120, Zárate - Diagnóstico computarizado, frenos y tren delantero",
    phone: "+54 9 3487 58-9410",
    instagram: "zaratemotorsport",
    email: "zarate.motorsport@gmail.com",
    google_id: "seed_mecanica_zarate",
    userName: "Zárate Motor Sport",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    categoryId: 2, // Automotive
    subcategoryId: 10, // Mechanics
    planTypeId: 3, // Semestral
  },
  {
    name: "Lavadero Express Zárate",
    label: "Lavado Artesanal y Chasis",
    description: "Rivadavia 920, Zárate - Lavado completo, encerado y limpieza de tapizados",
    phone: "+54 9 3487 44-5588",
    instagram: "lavaderoexpress.zarate",
    email: "lavadero.express.zarate@gmail.com",
    google_id: "seed_lavadero_zarate",
    userName: "Lavadero Express Zárate",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80",
    categoryId: 2, // Automotive
    subcategoryId: 13, // Car Wash
    planTypeId: 1, // Mensual
  },
  {
    name: "Veterinaria del Sol Zárate",
    label: "Clínica Veterinaria & Urgencias",
    description: "19 de Marzo 415, Zárate - Atención clínica, cirugías y vacunación",
    phone: "+54 9 3487 42-8900",
    instagram: "veterinariadelsol.zarate",
    email: "veterinaria.delsol.zarate@gmail.com",
    google_id: "seed_vetsol_zarate",
    userName: "Veterinaria del Sol Zárate",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
    categoryId: 3, // Pets
    subcategoryId: 14, // Veterinary Clinics
    planTypeId: 4, // Anual
  },
  {
    name: "Huellitas Pet Shop & Grooming",
    label: "Peluquería Canina y Pet Shop",
    description: "Rivadavia 530, Zárate - Baños, cortes de raza, alimentos balanceados y accesorios",
    phone: "+54 9 3487 63-4411",
    instagram: "huellitaszarate",
    email: "huellitas.zarate@gmail.com",
    google_id: "seed_huellitas_zarate",
    userName: "Huellitas Zárate",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
    categoryId: 3, // Pets
    subcategoryId: 15, // Pet Grooming
    planTypeId: 2, // Trimestral
  },
  {
    name: "ClimaTech Climatización Zárate",
    label: "Instalación y Service de Aires Acondicionados",
    description: "Almirante Brown 280, Zárate - Instalaciones matriculadas, carga de gas y mantenimiento",
    phone: "+54 9 3487 71-2233",
    instagram: "climatechzarate",
    email: "climatech.zarate@gmail.com",
    google_id: "seed_climatech_zarate",
    userName: "ClimaTech Zárate",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    categoryId: 4, // Home Services
    subcategoryId: 18, // Air Conditioning
    planTypeId: 3, // Semestral
  },
  {
    name: "ElectroZárate Soluciones Eléctricas",
    label: "Electricista Matriculado Zárate",
    description: "Ituzaingó 640, Zárate - Instalaciones domiciliarias, tableros eléctricos y urgencias 24hs",
    phone: "+54 9 3487 51-2890",
    instagram: "electrozarate",
    email: "electro.zarate@gmail.com",
    google_id: "seed_electrozarate",
    userName: "ElectroZárate",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
    categoryId: 4, // Home Services
    subcategoryId: 19, // Electrical Services
    planTypeId: 4, // Anual
  }
];

async function seedZaratePlaces() {
  const country = await prisma.country.findFirst({ where: { name: "Argentina" } });
  const state = await prisma.state.findFirst({ where: { name: "Buenos Aires" } });
  const city = await prisma.city.findFirst({ where: { name: "Zárate" } });

  if (!country || !state || !city) {
    throw new Error(`Country, state or city not found`);
  }

  for (const place of zaratePlaces) {
    let user = await prisma.user.findUnique({ where: { email: place.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          google_id: place.google_id,
          nombre: place.userName,
          email: place.email,
          foto: place.image,
        }
      });
    }

    const existingService = await prisma.service.findUnique({
      where: { userId: user.id }
    });

    let service;
    if (existingService) {
      service = await prisma.service.update({
        where: { id: existingService.id },
        data: {
          name: place.name,
          label: place.label,
          description: place.description,
          phone: place.phone,
          instagram: place.instagram,
          email: place.email,
          image: place.image,
          active: true,
          validated: true,
          paid: true,
          countryId: country.id,
          stateId: state.id,
          cityId: city.id,
          categoryId: place.categoryId,
          subcategoryId: place.subcategoryId,
        }
      });
    } else {
      service = await prisma.service.create({
        data: {
          name: place.name,
          label: place.label,
          description: place.description,
          phone: place.phone,
          instagram: place.instagram,
          email: place.email,
          image: place.image,
          active: true,
          validated: true,
          paid: true,
          countryId: country.id,
          stateId: state.id,
          cityId: city.id,
          categoryId: place.categoryId,
          subcategoryId: place.subcategoryId,
          userId: user.id,
        }
      });
    }

    const existingPlan = await prisma.plan.findFirst({
      where: { serviceId: service.id }
    });

    if (!existingPlan) {
      const now = new Date();
      const endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      await prisma.plan.create({
        data: {
          startDate: now,
          endDate: endDate,
          paymentStatus: true,
          planTypeId: place.planTypeId,
          serviceId: service.id,
        }
      });
    }
  }

  const count = await prisma.service.count({ where: { cityId: city.id } });
  console.log(`Total services in Zárate: ${count}`);
}

seedZaratePlaces()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
