// Flynn Scheduler App with Edit Mode
import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const logo = "/logo.png";

const foremen = [
  "Adrian McHardy", "Allan Crowfoot", "Brandon Wilson", "Brent Heyd", "Edward Walt",
  "Erik Turnbull", "Glenn Bissett", "Jeff Ball", "Jeff Thul", "Ken Kory",
  "Konnor Chelkowski", "Tom Inman", "Tyler Swanson", "Jordan Kaiser"
];

const employees = [
  "Adrian McHardy", "Allan Crowfoot", "Andrew Smith", "Ben Swan", "Brandon Wilson",
  "Brent Heyd", "Charlie Williams", "Cole Sather", "Draven Cowan", "Edward Walt",
  "Erik Turnbull", "Ezra Oucharek", "Glenn Bissett", "Jeff Ball", "Jeff Thul",
  "John Kaiser", "John Yildiz (Muhammet)", "Jordan Kaiser", "Ken Kory",
  "Konnor Chelkowski", "Matreno Bajao", "Serdal Muslu", "Tom Inman", "Tyler Swanson"
];

function App() {
  const [schedule, setSchedule] = useState([]);
  const [formData, setFormData] = useState({
    foreman: "",
    helpers: ["", "", ""],
    location: "",
    details: "",
    date: ""
  });
  const [editIndex, setEditIndex] = useState(null);
  const printRef = useRef();

  const handleSubmit = () => {
    const selectedNames = [formData.foreman, ...formData.helpers.filter(h => h)];
    const duplicate = selectedNames.find(name =>
      schedule.some((e, idx) => e.name === name && (editIndex === null || idx < editIndex || idx > editIndex + formData.helpers.length))
    );
    if (duplicate) {
      alert(`${duplicate} is already assigned to a task.`);
      return;
    }
    const newEntries = [
      { name: formData.foreman, role: "Foreman", location: formData.location, details: formData.details },
      ...formData.helpers.filter(h => h).map(h => ({
        name: h,
        role: "Helper",
        location: formData.location,
        details: formData.details
      }))
    ];
    if (editIndex !== null) {
      const updatedSchedule = [...schedule];
      const originalGroupSize = schedule.slice(editIndex).findIndex(e => e.role === "Foreman" && e !== schedule[editIndex]) || formData.helpers.length + 1;
      updatedSchedule.splice(editIndex, originalGroupSize, ...newEntries);
      setSchedule(updatedSchedule);
      setEditIndex(null);
    } else {
      setSchedule([...schedule, ...newEntries]);
    }
    setFormData({ foreman: "", helpers: ["", "", ""], location: "", details: "", date: formData.date });
  };

  const handleEdit = (groupIdx) => {
    const entries = groupedSchedule[groupIdx];
    const index = schedule.findIndex(e => e.name === entries.foreman);
    setFormData({
      foreman: entries.foreman,
      helpers: [entries.helpers[0] || "", entries.helpers[1] || "", entries.helpers[2] || ""],
      location: entries.location,
      details: entries.details,
      date: formData.date
    });
    setEditIndex(index);
  };

  const allUsed = schedule.map(e => e.name);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Flynn_Schedule_${formData.date || 'Schedule'}.pdf`);
  };

  const groupedSchedule = [];
  schedule.forEach((entry) => {
    if (entry.role === "Foreman") {
      groupedSchedule.push({ foreman: entry.name, location: entry.location, details: entry.details, helpers: [] });
    } else {
      const lastGroup = groupedSchedule[groupedSchedule.length - 1];
      if (lastGroup) lastGroup.helpers.push(entry.name);
    }
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Flynn Scheduler</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Date (e.g., May 9 Schedule)"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
        <select
          value={formData.foreman}
          onChange={(e) => setFormData({ ...formData, foreman: e.target.value })}
        >
          <option value="">Select Foreman</option>
          {foremen.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        {formData.helpers.map((h, idx) => (
          <select
            key={idx}
            value={h}
            onChange={(e) => {
              const updated = [...formData.helpers];
              updated[idx] = e.target.value;
              setFormData({ ...formData, helpers: updated });
            }}
          >
            <option value="">Select Helper {idx + 1}</option>
            {employees.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        ))}
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
        <input
          type="text"
          placeholder="Details / Notes"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        />
        <button onClick={handleSubmit}>{editIndex !== null ? "Update" : "Add"}</button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleDownloadPDF}>📄 Download PDF</button>
      </div>

      <div ref={printRef}>
        {formData.date && <h3>{formData.date}</h3>}
        <img src={logo} alt="Flynn Logo" style={{ width: 100, marginBottom: 10 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          {groupedSchedule.map((group, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                width: "300px",
                background: "#f9f9f9",
                boxShadow: "2px 2px 6px rgba(0,0,0,0.05)"
              }}
            >
              <h4 style={{ margin: 0, color: "#2b4d66" }}>{group.location}</h4>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>👷 {group.foreman}</p>
              {group.helpers.map((helper, i) => (
                <p key={i} style={{ margin: 0 }}>🔧 {helper}</p>
              ))}
              {group.details && (
                <p style={{ marginTop: "8px", fontSize: "0.85em", color: "#666" }}>📝 {group.details}</p>
              )}
              <button className="no-print" onClick={() => handleEdit(idx)} style={{ marginTop: "10px" }}>✏️ Edit</button>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print" style={{ display: "block", marginTop: "20px" }}>
        <h4>All Employees</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {employees.map((name) => (
            <li
              key={name}
              style={{
                backgroundColor: allUsed.includes(name) ? '#ffe6e6' : '#f0f0f0',
                color: allUsed.includes(name) ? 'darkred' : 'black',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '4px 8px'
              }}
            >
              {name} {allUsed.includes(name) ? '✓' : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
