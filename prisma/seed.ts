// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const BusinessStatus: Record<string, any> = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};
import { seedBusinesses } from "./seed-businesses";
import { seedCategories, seedCities } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const cityIdBySlug = new Map<string, string>();
  const categoryIdBySlug = new Map<string, string>();
  const subcategoryIdByKey = new Map<string, string>();

  for (const city of seedCities) {
    const createdCity = await prisma.city.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        province: city.province,
        country: city.country,
      },
      create: city,
    });

    cityIdBySlug.set(city.slug, createdCity.id);
  }

  for (const [categoryIndex, category] of seedCategories.entries()) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: categoryIndex,
      },
      create: {
        name: category.name,
        slug: category.slug,
        sortOrder: categoryIndex,
      },
    });

    categoryIdBySlug.set(category.slug, createdCategory.id);

    for (const [subcategoryIndex, subcategory] of category.subcategories.entries()) {
      const createdSubcategory = await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: createdCategory.id,
            slug: subcategory.slug,
          },
        },
        update: {
          name: subcategory.name,
          sortOrder: subcategoryIndex,
        },
        create: {
          categoryId: createdCategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
          sortOrder: subcategoryIndex,
        },
      });

      subcategoryIdByKey.set(
        `${category.slug}:${subcategory.slug}`,
        createdSubcategory.id
      );

      for (const cityId of cityIdBySlug.values()) {
        await prisma.subcategoryCity.upsert({
          where: {
            subcategoryId_cityId: {
              subcategoryId: createdSubcategory.id,
              cityId,
            },
          },
          update: {},
          create: {
            subcategoryId: createdSubcategory.id,
            cityId,
          },
        });
      }
    }
  }

  for (const business of seedBusinesses) {
    const cityId = cityIdBySlug.get(business.citySlug);
    const categoryId = categoryIdBySlug.get(business.categorySlug);

    if (!cityId || !categoryId) {
      throw new Error(`Missing city or category for business ${business.slug}`);
    }

    const subcategoryId = subcategoryIdByKey.get(
      `${business.categorySlug}:${business.subcategorySlug}`
    );

    if (!subcategoryId) {
      throw new Error(`Missing subcategory for business ${business.slug}`);
    }

    const status = business.status
      ? BusinessStatus[business.status]
      : BusinessStatus.ACTIVE;

    await prisma.business.upsert({
      where: { slug: business.slug },
      update: {
        name: business.name,
        description: business.description,
        addressLine1: business.addressLine1,
        neighborhood: business.neighborhood,
        phone: business.phone,
        whatsappNumber: business.whatsappNumber,
        instagramHandle: business.instagramHandle,
        websiteUrl: business.websiteUrl,
        coverImageUrl: business.coverImageUrl,
        cityId,
        subcategoryId,
        status,
        isFeatured: business.isFeatured ?? false,
      },
      create: {
        name: business.name,
        slug: business.slug,
        description: business.description,
        addressLine1: business.addressLine1,
        neighborhood: business.neighborhood,
        phone: business.phone,
        whatsappNumber: business.whatsappNumber,
        instagramHandle: business.instagramHandle,
        websiteUrl: business.websiteUrl,
        coverImageUrl: business.coverImageUrl,
        cityId,
        subcategoryId,
        status,
        isFeatured: business.isFeatured ?? false,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
