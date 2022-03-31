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
    orderBy: [
      { 
        votes: { _count: 'desc' } 
      },
      {
        updatedAt: 'desc'
      }
    ],
  });
}

export function getMovieWeeklyListItems({ userId }: { userId: User["id"] }) {
  let from, to
  const current = new Date()
  if (current.getDay() <= 5) {
    from = current.setDate(current.getDate() - current.getDay())
    to = current.setDate(current.getDate() + (5 - current.getDay()))
  } else {
    from = current
    to = current.setDate(current.getDate() + 6)
  }
  return prisma.movie.findMany({
    select: { 
      id: true, 
      title: true, 
      votes: {
        where: {
          userId: userId
        }
      } 
    },
    where: {
      updatedAt: {
        gte: new Date(from),
        lt: new Date(to)
      }
    },
    orderBy: [
      { 
        votes: { _count: 'desc' } 
      },
      {
        updatedAt: 'desc'
      }
    ],
  });
}

export function getMovieRecentListItems({ userId }: { userId: User["id"] }) {
  let from, to
  const current = new Date()
  if (current.getDay() <= 5) {
    from = current.setDate(current.getDate() - current.getDay())
    to = current.setDate(current.getDate() + (5 - current.getDay()))
  } else {
    from = current
    to = current.setDate(current.getDate() + 6)
  }
  return prisma.movie.findMany({
    select: { 
      id: true, 
      title: true, 
      votes: {
        where: {
          userId: userId
        }
      } 
    },
    where: {
      updatedAt: {
        gte: new Date(from),
        lt: new Date(to)
      }
    },
    orderBy: [
      {
        updatedAt: 'desc'
      }
    ],
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
