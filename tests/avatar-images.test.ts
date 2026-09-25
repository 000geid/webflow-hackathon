import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { AVATAR_IMAGES, avatarImageFor } from "../src/lib/ui/avatar-images";

test("every avatar path points to a real file in /public", () => {
  assert.equal(AVATAR_IMAGES.length, 18);
  for (const path of AVATAR_IMAGES) assert.ok(existsSync(`public${path}`), path);
});

test("the same name always gets the same avatar, ignoring case and extra spaces", () => {
  assert.equal(avatarImageFor("Ana"), avatarImageFor("  ana "));
  assert.equal(avatarImageFor("Diego"), avatarImageFor("Diego"));
  assert.ok(AVATAR_IMAGES.includes(avatarImageFor("")));
});

test("names spread across the avatar set", () => {
  const used = new Set(Array.from({ length: 200 }, (_, i) => avatarImageFor(`jugador ${i}`)));
  assert.ok(used.size >= 15, `only ${used.size} distinct avatars`);
});
