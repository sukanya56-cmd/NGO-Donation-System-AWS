import { useEffect, useState } from "react";

function AdminDashboard() {
  const [requirements, setRequirements] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const requirementResponse = await fetch(
        "http://13.233.131.84:5000/api/requirements"
      );

      const donationResponse = await fetch(
        "http://13.233.131.84:5000/api/donations"
      );

      const requirementData = await requirementResponse.json();
      const donationData = await donationResponse.json();

      setRequirements(requirementData);
      setDonations(donationData);
    } catch (error) {
      console.log(error);
    }
  }

  const ngoNames = [];

  requirements.forEach((item) => {
    if (!ngoNames.includes(item.ngoName)) {
      ngoNames.push(item.ngoName);
    }
  });

  let totalAmount = 0;

  donations.forEach((item) => {
    totalAmount += Number(item.amount) || 0;
  });

  return (
    <div
      style={{
        backgroundColor: "#f4fbf6",
        minHeight: "100vh",
        padding: "30px"
      }}
    >
      <h1 style={{ color: "#166534" }}>
        👑 Admin Dashboard
      </h1>

      <p>
        Welcome to the administration panel of the NGO Donation System.
      </p>

      {/* STATISTICS */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "30px",
          marginBottom: "30px"
        }}
      >
        <div style={boxStyle}>
          <h2>🏢</h2>
          <h2>{ngoNames.length}</h2>
          <p>Total NGOs</p>
        </div>

        <div style={boxStyle}>
          <h2>📦</h2>
          <h2>{requirements.length}</h2>
          <p>Requirements</p>
        </div>

        <div style={boxStyle}>
          <h2>👥</h2>
          <h2>{donations.length}</h2>
          <p>Donations</p>
        </div>

        <div style={boxStyle}>
          <h2>💰</h2>
          <h2>
            ₹{totalAmount.toLocaleString("en-IN")}
          </h2>
          <p>Total Amount</p>
        </div>
      </div>

      {/* REQUIREMENTS */}

      <div style={sectionStyle}>
        <h2>📋 NGO Requirements</h2>

        {requirements.length === 0 ? (
          <p>No NGO requirements added yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>NGO</th>
                  <th style={cellStyle}>Type</th>
                  <th style={cellStyle}>Item</th>
                  <th style={cellStyle}>Quantity</th>
                  <th style={cellStyle}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {requirements.map((item) => (
                  <tr key={item.id}>
                    <td style={cellStyle}>
                      {item.ngoName}
                    </td>

                    <td style={cellStyle}>
                      {item.type}
                    </td>

                    <td style={cellStyle}>
                      {item.item}
                    </td>

                    <td style={cellStyle}>
                      {item.quantity}
                    </td>

                    <td style={cellStyle}>
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DONATIONS */}

      <div style={sectionStyle}>
        <h2>💳 Donations</h2>

        {donations.length === 0 ? (
          <p>No donations received yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>Donor</th>
                  <th style={cellStyle}>Email</th>
                  <th style={cellStyle}>Amount</th>
                  <th style={cellStyle}>Date</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((item) => (
                  <tr key={item.id}>
                    <td style={cellStyle}>
                      {item.name}
                    </td>

                    <td style={cellStyle}>
                      {item.email}
                    </td>

                    <td style={cellStyle}>
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>

                    <td style={cellStyle}>
                      {new Date(item.date).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const boxStyle = {
  backgroundColor: "white",
  padding: "20px",
  width: "200px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 3px 10px rgba(0,0,0,0.08)"
};

const sectionStyle = {
  backgroundColor: "white",
  padding: "25px",
  marginBottom: "25px",
  borderRadius: "12px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.08)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const cellStyle = {
  padding: "12px",
  borderBottom: "1px solid #dddddd",
  textAlign: "left"
};

export default AdminDashboard;