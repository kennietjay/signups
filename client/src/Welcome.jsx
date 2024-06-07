import React from "react";

const WelcomeEmail = ({ name }) => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1>Welcome, {name}!</h1>
      <p>
        We are excited to have you on board. If you have any questions, feel
        free to reach out.
      </p>
      <p>
        Best regards,
        <br />
        The Team
      </p>
    </div>
  );
};

export default WelcomeEmail;
