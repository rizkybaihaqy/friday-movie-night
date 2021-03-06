import { useEffect, useRef } from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import {
  createMovie,
  getMovieRecentListItems,
  getMovieWeeklyListItems,
} from "~/models/movie.server";
import { getUserId, requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type LoaderData = {
  movieWeeklyListItems: Awaited<ReturnType<typeof getMovieWeeklyListItems>>;
  movieRecentListItems: Awaited<ReturnType<typeof getMovieRecentListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  let userId = ""
  await getUserId(request).then(uid => {
    if (typeof uid === 'string') userId = uid
  });
  const movieWeeklyListItems = await getMovieWeeklyListItems({ userId: userId });
  const movieRecentListItems = await getMovieRecentListItems({ userId: userId });
  return json<LoaderData>({ movieWeeklyListItems, movieRecentListItems });
};

type ActionData = {
  errors?: {
    title?: string;
    vote?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  await createMovie({ title, userId });

  return redirect("/");
};

export default function MoviesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useOptionalUser();

  const actionData = useActionData() as ActionData;
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        {user ? (
          <>
            <h1 className="text-3xl font-bold">Vote or Add Your Fav Movie</h1>
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
              >
                Logout
              </button>
            </Form>
          </>
        ) : (
          <h1 className="text-3xl font-bold">
            Login Vote or Add Your Fav Movie
          </h1>
        )}
      </header>
      <main className="flex h-full bg-white">
        <div className="h-full w-8/12 overflow-auto border-r bg-gray-50">
          <h2 className="sticky top-0 bg-white p-4 text-xl text-blue-500">
            Top Voted Movie
          </h2>

          <hr />

          {data.movieWeeklyListItems.length === 0 ? (
            <p className="p-4">No movies yet</p>
          ) : (
            <ol className="list-inside list-decimal">
              {data.movieWeeklyListItems.map((movie) => (
                <li key={movie.id} className="border-b p-4 text-xl">
                  <span>{movie.title}</span>
                  <Form method="post" action="/vote" className="inline">
                    <input type="hidden" name="movieId" value={movie.id} />
                    <button type="submit" className="button float-right">
                      {movie.votes.length === 0 ? (
                        <FaRegHeart />
                      ) : (
                        <FaHeart />
                      )}
                    </button>
                  </Form>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex w-4/12 flex-col p-6">
          {user ? (
            <Form
              method="post"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
              }}
            >
              <div>
                <label className="flex w-full flex-col gap-1">
                  <span>Title: </span>
                  <input
                    ref={titleRef}
                    name="title"
                    className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                    aria-invalid={actionData?.errors?.title ? true : undefined}
                    aria-errormessage={
                      actionData?.errors?.title ? "title-error" : undefined
                    }
                  />
                </label>
                {actionData?.errors?.title && (
                  <div className="pt-1 text-red-700" id="title-error">
                    {actionData.errors.title}
                  </div>
                )}
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                  Save
                </button>
              </div>
            </Form>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600  "
            >
              Log In
            </Link>
          )}

          <div className="flex flex-col overflow-y-scroll">
            <h2 className="sticky top-0 bg-white">Recently Added Movies</h2>
            {data.movieWeeklyListItems.length === 0 ? (
              <p className="p-4">No movies yet</p>
            ) : (
              <ol className="list-inside list-decimal">
                {data.movieRecentListItems.map((movie) => (
                  <li key={movie.id} className="border-b p-4 text-xl">
                    <span>{movie.title}</span>
                    <Form method="post" action="/vote" className="inline">
                      <input type="hidden" name="movieId" value={movie.id} />
                      <button type="submit" className="button float-right">
                        {movie.votes.length === 0 ? (
                          <FaRegHeart />
                        ) : (
                          <FaHeart />
                        )}
                      </button>
                    </Form>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
