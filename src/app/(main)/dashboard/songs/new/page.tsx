import { SongFormPage } from "../_components/song-form-page";

export const dynamic = "force-dynamic";

export default function NewSongPage() {
  return (
    <div className="flex flex-col gap-5 p-2">
      <h1 className="text-xl font-medium">Add Song</h1>
      <SongFormPage />
    </div>
  );
}
