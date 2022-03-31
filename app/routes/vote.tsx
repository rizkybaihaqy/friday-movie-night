import {
  ActionFunction, json,
  LoaderFunction,
  redirect
} from "remix";
import { createVote, deleteVote, getExistVote } from "~/models/vote.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    movieId?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const movieId = formData.get("movieId");

  if (typeof movieId !== "string") {
    return json<ActionData>(
      { errors: { movieId: "Movie Id is required" } },
      { status: 400 }
    );
  }

  const exist = await getExistVote({movieId, userId})

  exist ? await deleteVote({ id: exist.id }) : await createVote({movieId, userId})

  return redirect("/");
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
