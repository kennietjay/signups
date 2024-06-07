// src/contexts/SignupContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import supabase from "../../supabase";

const MeetingContext = createContext();

const initialState = {
  isLoading: false,
  meetings: [],
  meeting: {},
  signups: [],
  meeting_id: null,
  currentSignup: {},
  error: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: action.payload, error: null };

    // Meetings
    case "meetings/loaded":
      return { ...state, isLoading: false, meetings: action.payload };
    case "meeting/loaded":
      return { ...state, isLoading: false, currentMeeting: action.payload };

    //Signups
    case "signups/loaded":
      return { ...state, isLoading: false, signups: action.payload };
    case "signup/loaded":
      return { ...state, isLoading: false, currentSignup: action.payload };

    case "signup/created":
      return {
        ...state,
        isLoading: false,
        signups: [...state.signups, action.payload],
      };
    case "signup/updated":
      return {
        ...state,
        isLoading: false,
        signups: state.signups.map((signup) =>
          signup.id === action.payload.id ? action.payload : signup
        ),
      };
    case "signup/deleted":
      return {
        ...state,
        isLoading: false,
        signups: state.signups.filter((signup) => signup.id !== action.payload),
      };

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      console.error("Unknown action type:", action.type);
      return state;
  }
};

const MeetingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadMeetings = useCallback(async () => {
    dispatch({ type: "loading", payload: true });

    try {
      const { data: meetings, error } = await supabase
        .from("meetings")
        .select("*,signups(first_name, last_name, email, phone)");
      if (error) throw error;

      dispatch({ type: "meetings/loaded", payload: meetings });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  }, []);

  const getMeetingById = useCallback(async (meeting_id) => {
    dispatch({ type: "loading", payload: true });

    try {
      const { data: meeting, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meeting_id);
      if (error) throw error;

      dispatch({ type: "meeting/loaded", payload: meeting[0] });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  }, []);

  // Sign up
  const createSignup = async (signupData, meetingId) => {
    try {
      dispatch({ type: "loading", payload: true });

      // Add meeting_id to signupData
      const signupWithMeetingId = {
        ...signupData,
        meeting_id: meetingId,
      };

      console.log(meetingId);

      const { data: newSignup, error } = await supabase
        .from("signups")
        .insert(signupWithMeetingId);

      if (error) throw error;

      loadMeetings();

      dispatch({ type: "signup/created", payload: newSignup[0] });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  };

  const getSignups = useCallback(async () => {
    dispatch({ type: "loading", payload: true });

    try {
      const { data: signups, error } = await supabase
        .from("signups")
        .select("*, meetings(*)");
      if (error) throw error;

      console.log(signups);

      dispatch({ type: "signups/loaded", payload: signups });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  }, []);

  //
  const getSignupById = useCallback(async (signupId) => {
    dispatch({ type: "loading", payload: true });

    try {
      const { data: signup, error } = await supabase
        .from("signups")
        .select("*")
        .eq("id", signupId);
      if (error) throw error;

      dispatch({ type: "signup/loaded", payload: signup[0] });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  }, []);

  const updateSignupById = useCallback(async (signupId, signupData) => {
    dispatch({ type: "loading", payload: true });

    try {
      const { data: updatedSignup, error } = await supabase
        .from("signups")
        .update(signupData)
        .eq("id", signupId);
      if (error) throw error;

      dispatch({ type: "signup/updated", payload: updatedSignup[0] });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  }, []);

  const deleteSignupById = useCallback(async (signupId) => {
    dispatch({ type: "loading", payload: true });

    try {
      const { error } = await supabase
        .from("signups")
        .delete()
        .eq("id", signupId);
      if (error) throw error;

      dispatch({ type: "signup/deleted", payload: signupId });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  }, []);

  //
  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  return (
    <MeetingContext.Provider
      value={{
        ...state,
        createSignup,
        getSignups,
        getSignupById,
        updateSignupById,
        deleteSignupById,
        loadMeetings,
        getMeetingById,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

const useMeetings = () => {
  const context = useContext(MeetingContext);

  if (!context) {
    throw new Error("useSignups must be used within a SignupProvider");
  }

  return context;
};

export { MeetingProvider, useMeetings };
