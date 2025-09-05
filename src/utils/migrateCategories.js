import { listCategories } from "../services/categoryService.js";
import { listBusinesses, updateBusiness } from "../services/businessService.js";

async function migrateCategories() {
  const allCategories = await listCategories();
  const allBusinesses = await listBusinesses();

  for (const biz of allBusinesses) {
    const newCats = biz.categories
      .map((name) => {
        const cat = allCategories.find((c) => c.name === name);
        return cat ? cat.id : null;
      })
      .filter(Boolean);

    await updateBusiness(biz.id, { categories: newCats });
    console.log(`Negocio "${biz.name}" actualizado`);
  }

  console.log("Migración completada!");
}

migrateCategories().catch(console.error);
