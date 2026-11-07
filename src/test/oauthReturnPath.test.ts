import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "@/lib/oauth-return-path";

describe("oauthReturnPath", () => {
  it("keeps same-origin paths, search parameters, and fragments", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#decision"))
      .toBe("/.lovable/oauth/consent?authorization_id=abc#decision");
  });

  it.each(["https://outside.example", "//outside.example", "/\\outside.example", "/bad\u0000path", "not-a-path"])(
    "rejects unsafe return target %j",
    (value) => expect(oauthReturnPath(value)).toBe("/"),
  );
});