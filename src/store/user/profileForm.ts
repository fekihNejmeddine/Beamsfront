import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GenderType } from "../../types/enum/Gender";


interface ProfileFormState {
  email: string;
  username: string;
  Gender: GenderType;
}

const initialState: ProfileFormState = {
  email: "",
  username: "",
  Gender: GenderType.Male,
};

export const profileFormSlice = createSlice({
  name: "profileForm",
  initialState,
  reducers: {
    setFormField: (
      state,
      action: PayloadAction<{ field: keyof ProfileFormState; value: string }>
    ) => {
      const { field, value } = action.payload;
      if (field === "Gender") {
        state.Gender = value as GenderType;
      } else {
        state[field] = value;
      }
    },
    setFormState: (state, action: PayloadAction<ProfileFormState>) => {
      return action.payload;
    },
    resetFormState: () => initialState,
  },
});

export const { setFormField, setFormState, resetFormState } =
  profileFormSlice.actions;

export default profileFormSlice.reducer;
