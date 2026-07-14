import { describe, it, expect } from "vitest";
import resumeReducer, { setPersonal, setEducation } from "./resume-slice";

describe("resumeSlice", () => {
  const initialState = {
    personal: { name: "", email: "" },
    education: { degree: "", college: "" },
  };

  it("should return the initial state", () => {
    expect(resumeReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setPersonal", () => {
    const payload = { name: "John Doe", email: "john@example.com" };
    const state = resumeReducer(initialState, setPersonal(payload));
    expect(state.personal).toEqual(payload);
  });

  it("should handle setEducation", () => {
    const payload = { degree: "BSc", college: "MIT" };
    const state = resumeReducer(initialState, setEducation(payload));
    expect(state.education).toEqual(payload);
  });

  it("should overwrite personal state", () => {
    const first = resumeReducer(initialState, setPersonal({ name: "Alice", email: "a@b.com" }));
    const second = resumeReducer(first, setPersonal({ name: "Bob", email: "b@b.com" }));
    expect(second.personal.name).toBe("Bob");
    expect(second.personal.email).toBe("b@b.com");
  });

  it("should overwrite education state", () => {
    const first = resumeReducer(initialState, setEducation({ degree: "BA", college: "Harvard" }));
    const second = resumeReducer(first, setEducation({ degree: "MA", college: "Stanford" }));
    expect(second.education.degree).toBe("MA");
    expect(second.education.college).toBe("Stanford");
  });

  it("setPersonal and setEducation are independent", () => {
    let state = resumeReducer(initialState, setPersonal({ name: "Test", email: "t@t.com" }));
    state = resumeReducer(state, setEducation({ degree: "PhD", college: "Oxford" }));
    expect(state.personal).toEqual({ name: "Test", email: "t@t.com" });
    expect(state.education).toEqual({ degree: "PhD", college: "Oxford" });
  });
});
