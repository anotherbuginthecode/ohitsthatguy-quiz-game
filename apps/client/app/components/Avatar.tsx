import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";

export default function Avatar() {
  const avatar = createAvatar(identicon, {
    seed: "",
    size: 50,
    scale: 100,
    radius: 50,
    backgroundColor: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff"],
  });
  const svg = avatar.toString();

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
