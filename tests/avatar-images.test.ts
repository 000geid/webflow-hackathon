import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { AVATARS, isAvatar } from "../src/lib/game/avatars";
import { AVATAR_IMAGES, avatarSrc } from "../src/lib/ui/avatar-images";

test("every selectable avatar has an image in /public/avatars", () => {
  assert.equal(AVATARS.length, 18);
  assert.equal(AVATAR_IMAGES.length, 18);
  for (const path of AVATAR_IMAGES) assert.ok(existsSync(`public${path}`), path);
});

test("only the 18 avatar ids are accepted (old emoji avatars are not)", () => {
  assert.equal(avatarSrc("avatar7"), "/avatars/avatar7.jpg");
  assert.ok(isAvatar("avatar18"));
  for (const value of ["avatar0", "avatar19", "🦊", "../secret", "", null]) assert.equal(isAvatar(value), false);
});
