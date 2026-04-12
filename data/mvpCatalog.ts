export type MvpCity = {
  name: string;
  slug: string;
  province: string;
  country: string;
};

export type MvpSubcategory = {
  name: string;
  slug: string;
};

export type MvpCategory = {
  name: string;
  slug: string;
  subcategories: MvpSubcategory[];
};

export const mvpCities: MvpCity[] = [
  {
    name: "Zarate",
    slug: "zarate",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    name: "Campana",
    slug: "campana",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    name: "Escobar",
    slug: "escobar",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    name: "Pilar",
    slug: "pilar",
    province: "Buenos Aires",
    country: "Argentina",
  },
];

export const mvpCategories: MvpCategory[] = [
  {
    name: "Beauty & Aesthetics",
    slug: "beauty-aesthetics",
    subcategories: [
      { name: "Hair Salons", slug: "hair-salons" },
      { name: "Nail Studios", slug: "nail-studios" },
      { name: "Aesthetic Clinics", slug: "aesthetic-clinics" },
      { name: "Laser Hair Removal", slug: "laser-hair-removal" },
      { name: "Facial Treatments", slug: "facial-treatments" },
      { name: "Massage & Spa", slug: "massage-spa" },
      { name: "Barber Shops", slug: "barber-shops" },
      { name: "Makeup Artists", slug: "makeup-artists" },
    ],
  },
  {
    name: "Automotive",
    slug: "automotive",
    subcategories: [
      { name: "Car Detailing", slug: "car-detailing" },
      { name: "Mechanics", slug: "mechanics" },
      { name: "Tire Shops", slug: "tire-shops" },
      { name: "Car Accessories", slug: "car-accessories" },
      { name: "Car Wash", slug: "car-wash" },
    ],
  },
  {
    name: "Pets",
    slug: "pets",
    subcategories: [
      { name: "Veterinary Clinics", slug: "veterinary-clinics" },
      { name: "Pet Grooming", slug: "pet-grooming" },
      { name: "Pet Shops", slug: "pet-shops" },
      { name: "Pet Training", slug: "pet-training" },
    ],
  },
  {
    name: "Home Services",
    slug: "home-services",
    subcategories: [
      { name: "Air Conditioning", slug: "air-conditioning" },
      { name: "Electrical Services", slug: "electrical-services" },
      { name: "Renovations", slug: "renovations" },
      { name: "Smart Home / Domotics", slug: "smart-home-domotics" },
      { name: "Appliance Repair", slug: "appliance-repair" },
    ],
  },
];
