import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import SignupForm from "../components/SignupForm";
import { useMeetings } from "../components/contexts/Meeting";
import axios from "axios";
import logo from "../../public/images/sababu-logo.png";
import supabase from "../supabase";

const apiUrl = "https://sababufund.netlify.app/send-email";

function Home() {
  const [isSignup, setIsSignup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { createSignup, isLoading, loadMeetings } = useMeetings();
  const [response, setResponse] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    lasst_name: "",
    email: "",
    phone: "",
    date: "",
    member: "",
  });

  //
  useEffect(() => {
    try {
      const channel = supabase
        .channel("realtime siggnup")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "signups",
          },
          () => {
            loadMeetings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.log(error.message);
    }
  }, [loadMeetings]);

  //
  const sendEmail = async (emailData) => {
    try {
      console.log("Sending request to server");
      const res = await axios.post(`${apiUrl}`, emailData);

      console.log(formData.meetingSubject);

      if (res.status === 200) {
        console.log("Received response from server", res);
        // setResponse(res.data);
        return true;
      } else {
        console.log("Failed to send email", res);
        return false;
      }
    } catch (error) {
      console.error("Error making API call:", error);
      // setResponse({ error: error.message });
    }
  };

  const handeSignupSuccess = () => {
    setShowSuccessMessage(true);
  };

  const handleSignup = () => {
    setIsSignup(true);
  };

  if (isLoading) {
    return <p>Loading... </p>;
  }

  return (
    <main>
      <MainSection
        createSignup={createSignup}
        isSignup={isSignup}
        setIsSignup={setIsSignup}
        handleSignup={handleSignup}
        handeSignupSuccess={handeSignupSuccess}
        showSuccessMessage={showSuccessMessage}
        setShowSuccessMessage={setShowSuccessMessage}
        sendEmail={sendEmail}
        response={response}
        formData={formData}
        setFormData={setFormData}
      />
      <RSVPList />
      <Footer />
    </main>
  );
}

export default Home;

function MainSection({
  isSignup,
  setIsSignup,
  handleSignup,
  createSignup,
  showSuccessMessage,
  handeSignupSuccess,
  setShowSuccessMessage,
  response,
  sendEmail,
  formData,
  setFormData,
}) {
  return (
    <section className="section">
      <Logo />
      {showSuccessMessage && (
        <Alert
          variant="success"
          dismissible
          onClick={() => setShowSuccessMessage(false)}
        >
          Sign up successful! Check your email for meeting details.
        </Alert>
      )}
      <div className="meeting-details">
        <div>
          <h1>Sababu Fund Inc.</h1>
          <h3>Mid Year Review. July 7th 2024 @ 5:00pm (est).</h3>
          <h3>Hosted online on Zoom.</h3>
        </div>
        <button onClick={handleSignup}>Add Your Name</button>
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </div>
      {isSignup && (
        <SignupForm
          setSigning={setIsSignup}
          createSignup={createSignup}
          onSuccess={handeSignupSuccess}
          sendEmail={sendEmail}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </section>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img src={logo} alt="Sababu Fund Inc." />{" "}
    </div>
  );
}

function RSVPList() {
  return (
    <section className="rsvpList">
      <h2>Attendees List</h2>
      <p>Members who signed up already.</p>
      <DynamicTable />
    </section>
  );
}

function Footer() {
  return (
    <div className="copy-right">
      <p>
        Sababu Fund Inc. &copy; 2024.{" "}
        <span className="last-update">
          Last updated {new Date().toDateString()}.
        </span>
      </p>
    </div>
  );
}

// src/components/DynamicTable.jsx
const DynamicTable = () => {
  const { meetings } = useMeetings();
  const signups = meetings.length > 0 ? meetings[0].signups : null;

  const updatedSignups = signups?.map((signup) => ({
    name: `${signup.first_name} ${signup.last_name}`,
    email: signup.email,
    phone: signup.phone,
  }));

  return (
    <table className="signup-table">
      <thead>
        <tr>
          <th className="number-column">#</th>
          {updatedSignups?.length > 0 &&
            Object.keys(updatedSignups[0]).map((key) => (
              <th key={key}>{titleCase(key)}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {updatedSignups?.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td className="number-column">{rowIndex + 1}</td>
            {Object.values(row).map((value, colIndex) => (
              <td key={colIndex}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

//Title case
function titleCase(string) {
  return string.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}
