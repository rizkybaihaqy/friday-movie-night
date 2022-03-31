import type { User, Movie, Vote } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Vote } from "@prisma/client";

export function getExistVote({
  movieId,
  userId,
}: {
  userId: User["id"],
  movieId: Movie["id"];
}) {
  return prisma.vote.findFirst({
    where: { userId, movieId }
  })
}

export function createVote({
  movieId,
  userId,
}: {
  userId: User["id"],
  movieId: Movie["id"];
}) {
  return prisma.vote.create({
    data: {
      movie: {
        connect: {
          id: movieId
        }
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  }); 
}

export function deleteVote({
  id,
}: Pick<Vote, "id">) {
  return prisma.vote.delete({
    where: { id },
  });
}
