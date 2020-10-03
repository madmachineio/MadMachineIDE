import { exsitProjectFile } from "../src/utils/path";

test("path fails", () => {
  expect(exsitProjectFile("")).toBe(false);
});
