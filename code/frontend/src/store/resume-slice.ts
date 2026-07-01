import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ResumeState = {
  personal: {
    name: string;
    email: string;
  };
  education: {
    degree: string;
    college: string;
  };
};

const initialState: ResumeState = {
  personal: { name: "", email: "" },
  education: { degree: "", college: "" },
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setPersonal(state, action: PayloadAction<ResumeState["personal"]>) {
      state.personal = action.payload;
    },
    setEducation(state, action: PayloadAction<ResumeState["education"]>) {
      state.education = action.payload;
    },
  },
});

export const { setPersonal, setEducation } = resumeSlice.actions;
export default resumeSlice.reducer;