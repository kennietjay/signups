import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import styles from "./SignupForm.module.css";
import { useMeetings } from "./contexts/Meeting";
import supabase from "../supabase";

//@ts-ignore
const recognizedEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "gmx.net",
];

const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isRecognizedEmailDomain = (email) => {
  const domain = email.split("@")[1];
  return recognizedEmailDomains.includes(domain) || domain.endsWith(".org");
};

const isValidUSPhone = (phone) => {
  const phoneRegex =
    /^\(?([2-9][0-9]{2})\)?[-.●]?([2-9][0-9]{2})[-.●]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

function SignupForm({
  setSigning,
  onSuccess,
  sendEmail,
  formData,
  setFormData,
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [signupExists, setSignupExists] = useState("");

  const { createSignup, meetings } = useMeetings();

  // Only set meetingId when the component mounts
  const meetingId = meetings.length > 0 ? meetings[0].id : null;

  useEffect(() => {
    if (meetingId) {
      meetings.meeting_id = meetingId;
    }
  }, [meetingId, meetings]);

  const handleInputChange = (e) => {
    const { name, value, type, radio } = e.target;

    if (type === "radio") {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure the 'member' field has a value
    if (formData.member === undefined || formData.member === "") {
      setErrorMsg("Please select if you are a member.");
      return;
    }

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone
    ) {
      setErrorMsg("All fields are required");
      return;
    }

    if (!isValidEmailFormat(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!isRecognizedEmailDomain(formData.email)) {
      setErrorMsg(
        "Please use an email from recognized domains like Gmail, Yahoo, or .org domains."
      );
      return;
    }

    if (!isValidUSPhone(formData.phone)) {
      setErrorMsg("Please enter a valid US phone number.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const newUser = {
        member: formData.member,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      };

      console.log(newUser);

      // Check if the email or phone already exists
      const { data: existingSignups, error: existingSignupsError } =
        await supabase
          .from("signups")
          .select("*")
          .or(`email.eq.${formData.email},phone.eq.${formData.phone}`);

      if (existingSignupsError) throw existingSignupsError;

      if (existingSignups.length > 0) {
        setSignupExists("Email or phone number already exists.");
        setLoading(false); // Stop loading
        return false; // Return false to indicate the signup was not created
      } else {
        // Attempt to send the email first
        const emailSent = await sendEmail();

        if (!emailSent) {
          setErrorMsg("Failed to send confirmation email. Signup aborted.");
          setLoading(false);
          return;
        }

        // await createSignup(newUser, meetingId);
        setMsg("Signup successful!");

        // Delay closing the form to display the success message
        setSigning(false);
        onSuccess();
        setFormData("");
      }
    } catch (error) {
      setErrorMsg("Error creating sign up.");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.modal} ${styles.signupModal}`}>
      <div className={styles.modalContent}>
        <h3>Sign up</h3>
        <form onSubmit={handleSubmit}>
          {msg && <Alert variant="success">{msg}</Alert>}
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          {signupExists && (
            <Alert
              variant="warning"
              dismissible
              onClose={() => setSignupExists("")}
            >
              {signupExists}
            </Alert>
          )}

          <div className={styles.radioInputBoxes}>
            <label>Are you a Sababu Fund member?</label>
            <div>
              <label className={styles.radioLabel}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="member"
                  value="yes"
                  checked={formData.member === "yes"}
                  onChange={handleInputChange}
                />
                Yes
              </label>
              <label className={styles.radioLabel}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="member"
                  value="no"
                  checked={formData.member === "no"}
                  onChange={handleInputChange}
                />
                No
              </label>
            </div>
          </div>

          <div className={styles.inputControl}>
            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputControl}>
            <label htmlFor="last_name">Last Name:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputControl}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputControl}>
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => setSigning(false)}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
