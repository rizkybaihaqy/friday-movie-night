import type { User, Movie } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Movie } from "@prisma/client";

export function getMovie({
  id,
  userId,
}: Pick<Movie, "id"> & {
  userId: User["id"];
}) {
  return prisma.movie.findFirst({
    where: { id, userId },
  });
}

export function getMovieListItems() {
  return prisma.movie.findMany({
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createMovie({
  title,
  userId,
}: Pick<Movie, "title"> & {
  userId: User["id"];
}) {
  return prisma.movie.create({
    data: {
      title,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteMovie({
  id,
  userId,
}: Pick<Movie, "id"> & { userId: User["id"] }) {
  return prisma.movie.deleteMany({
    where: { id, userId },
  });
}
