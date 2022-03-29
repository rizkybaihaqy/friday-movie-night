import { Form, json, useLoaderData, Outlet, Link, NavLink } from "remix";
import type { LoaderFunction } from "remix";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getMovieListItems } from "~/models/movie.server";

type LoaderData = {
  movieListItems: Awaited<ReturnType<typeof getMovieListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const movieListItems = await getMovieListItems({ userId });
  return json<LoaderData>({ movieListItems });
};

export default function MoviesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Movies</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-8/12 border-r bg-gray-50">
          <h2 className="block p-4 text-xl text-blue-500">Top Voted Movie</h2>

          <hr />

          {data.movieListItems.length === 0 ? (
            <p className="p-4">No movies yet</p>
          ) : (
            <ol>
              {data.movieListItems.map((movie) => (
                <li key={movie.id} className="block border-b p-4 text-xl">
                  📝 {movie.title}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="w-4/12 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
