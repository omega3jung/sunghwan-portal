import { STORYBOOK_URL } from "@/lib/config/storybook";

export default function StorybookPage() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
      <iframe
        className="block h-full w-full border-0"
        src={STORYBOOK_URL}
        title="Storybook"
      />
    </div>
  );
}
