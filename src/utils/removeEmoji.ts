import emojiRegex from "emoji-regex";

export function removeEmoji(str: string) {
  const regex = emojiRegex();
  return str.replace(regex, "");
}
