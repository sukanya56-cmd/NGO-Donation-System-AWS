import { useState } from "react";

function NGODashboard() {
  const [form, setForm] = useState({
    ngoName: "",
    type: "Money",
    item: "",
    quantity: "",
    amount: "",
    description: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://13.233.131.84:5000/api/requirements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Requirement added successfully! ❤️");

        setForm({
          ngoName: "",
          type: "Money",
          item: "",
          quantity: "",
          amount: "",
          description: ""
        });
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage(
        "Backend is not connected. Please start the backend server."
      );
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        <h1 style={styles.heading}>
          NGO Dashboard
        </h1>

        <p style={styles.subtitle}>
          Add your NGO's current requirements
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>

          <label>NGO Name</label>

          <input
            type="text"
            name="ngoName"
            value={form.ngoName}
            onChange={handleChange}
            placeholder="Enter NGO name"
            required
          />

          <label>Requirement Type</label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Money">Money</option>
            <option value="Equipment">Equipment</option>
            <option value="Supplies">Supplies</option>
          </select>

          <label>What do you need?</label>

          <input
            type="text"
            name="item"
            value={form.item}
            onChange={handleChange}
            placeholder="Example: Wheelchairs"
            required
          />

          <label>Quantity</label>

          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Example: 10"
          />

          <label>Amount / Value (₹)</label>

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Example: 50000"
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Explain why this requirement is needed..."
            rows="4"
          />

          <button type="submit">
            Add Requirement
          </button>

          {message && (
            <p style={styles.message}>
              {message}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0fdf4",
    padding: "50px 20px"
  },

  container: {
    maxWidth: "650px",
    margin: "auto",
    background: "white",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
  },

  heading: {
    color: "#166534",
    textAlign: "center",
    marginBottom: "8px"
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  message: {
    textAlign: "center",
    color: "#15803d",
    fontWeight: "bold",
    marginTop: "10px"
  }
};

export default NGODashboard;