/**
 * Camada de acesso aos dados das viaturas.
 *
 * Hoje lê o ficheiro estático src/data/cars.ts. Para ligar a uma base de dados ou
 * painel de administração, basta reimplementar estas funções (ex.: fetch a uma API,
 * Prisma, Supabase…) mantendo as mesmas assinaturas — o resto do site não muda.
 */
import { CARS } from "@/data/cars";
import type { Car } from "@/types/car";

export async function getCars(): Promise<Car[]> {
  return CARS;
}

export async function getCarBySlug(slug: string): Promise<Car | undefined> {
  return CARS.find((c) => c.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  return CARS.map((c) => c.slug);
}

/** Viaturas semelhantes: mesma carroçaria, marca ou faixa de preço. */
export async function getSimilarCars(car: Car, limit = 3): Promise<Car[]> {
  return CARS.filter((c) => c.id !== car.id)
    .map((c) => {
      let score = 0;
      if (c.body === car.body) score += 3;
      if (c.brand === car.brand) score += 2;
      if (c.fuel === car.fuel) score += 1;
      const priceDiff = Math.abs(c.price - car.price) / car.price;
      score += Math.max(0, 2 - priceDiff * 4);
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}
