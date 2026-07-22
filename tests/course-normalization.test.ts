import assert from "node:assert/strict";
import test from "node:test";
import { courseAliases, normalizeCourse } from "../src/lib/courses";

test("course labels from legacy accounts normalize to canonical ids", () => {
  assert.equal(normalizeCourse("em1"), "em1");
  assert.equal(normalizeCourse("電磁気1"), "em1");
  assert.equal(normalizeCourse("電磁気Ⅰ"), "em1");
  assert.equal(normalizeCourse("em2"), "em2");
  assert.equal(normalizeCourse("電磁気2"), "em2");
  assert.equal(normalizeCourse("電磁気Ⅱ"), "em2");
  assert.equal(normalizeCourse("unknown"), null);
});

test("course aliases include canonical and legacy values for database filters", () => {
  assert.deepEqual(courseAliases("電磁気1"), ["em1", "電磁気1", "電磁気Ⅰ", "電磁気I"]);
  assert.deepEqual(courseAliases("電磁気2"), ["em2", "電磁気2", "電磁気Ⅱ", "電磁気II"]);
  assert.deepEqual(courseAliases("unknown"), []);
});
