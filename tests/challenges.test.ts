import assert from "node:assert/strict";
import { test } from "node:test";
import { parseChallenges } from "../src/lib/game/challenges";
const valid = () => ({ id: "one", fieldData: { activa: true, imagen: { url: "https://example.com/image.png" }, categoria: "Tech", "opcion-a": "Uno", "opcion-b": "Dos", "opcion-c": "Tres", "opcion-d": "Cuatro", "respuesta-correcta": " b " } });
test("CMS fields map to private round content", () => {
  const [round] = parseChallenges([valid()]);
  assert.equal(round.correctChoiceId, "B");
  assert.deepEqual(round.choices.map((c) => c.label), ["Uno", "Dos", "Tres", "Cuatro"]);
});
test("ignore inactive, malformed, draft, archived and duplicate challenges", () => {
  const inactive = valid(); inactive.fieldData.activa = false;
  const duplicateChoices = valid(); duplicateChoices.fieldData["opcion-b"] = "UNO";
  const unsafeImage = valid(); unsafeImage.fieldData.imagen.url = "javascript:alert(1)";
  const invalidAnswer = valid(); invalidAnswer.fieldData["respuesta-correcta"] = "E";
  assert.deepEqual(parseChallenges([inactive, duplicateChoices, unsafeImage, invalidAnswer, null, {}, { ...valid(), isDraft: true }, { ...valid(), isArchived: true }]), []);
  assert.equal(parseChallenges([valid(), valid()]).length, 1);
});
