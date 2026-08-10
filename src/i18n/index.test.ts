/**
 * Covers the two pieces of real logic this module owns: deriving text
 * direction from a language (i18n.md "direction is derived, never stored
 * separately"), and only triggering an instance language change when the
 * language actually differs. Instance setup/resource loading itself is
 * i18next's own tested behavior, not ours to re-test.
 */
import i18n, { getDirection, setLanguage } from "./index";

describe("getDirection", () => {
  it("returns rtl for Arabic", () => {
    expect(getDirection("ar")).toBe("rtl");
  });

  it("returns ltr for English", () => {
    expect(getDirection("en")).toBe("ltr");
  });
});

describe("setLanguage", () => {
  it("changes the instance language", () => {
    setLanguage("ar");
    expect(i18n.language).toBe("ar");
    setLanguage("en");
    expect(i18n.language).toBe("en");
  });

  it("is a no-op when the language is already active", () => {
    setLanguage("en");
    const changeLanguageSpy = jest.spyOn(i18n, "changeLanguage");
    setLanguage("en");
    expect(changeLanguageSpy).not.toHaveBeenCalled();
    changeLanguageSpy.mockRestore();
  });
});
