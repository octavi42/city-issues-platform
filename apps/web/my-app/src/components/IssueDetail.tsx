"use client";

import React from "react";

type StyleObject = {
  [key: string]: string | number | undefined;
};

type SeverityTagStyle = {
  display: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  backgroundColor: string;
  color: string;
};

// Define styles inline or import from a shared location
const styles = {
  content: {
    padding: "1.5rem",
    maxWidth: "28rem",
    margin: "0 auto",
    paddingBottom: "5rem"
  } as StyleObject,
  headerBar: {
    width: "3rem",
    height: "0.25rem",
    backgroundColor: "#E0E0E0",
    borderRadius: "0.125rem",
    margin: "0.5rem auto 1.5rem",
  } as StyleObject,
  // Sheet container wrapper
  sheetWrapper: {
    position: 'relative',
    backgroundColor: 'white',
    borderTopLeftRadius: '1.875rem',
    borderTopRightRadius: '1.875rem',
    boxShadow: '0 -5px 15px rgba(0,0,0,0.1)',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    width: '100%',
    maxWidth: '28rem',
    margin: '0 auto'
  } as StyleObject,
  // Drag handle at top of sheet
  dragHandle: {
    width: '3rem',
    height: '0.25rem',
    backgroundColor: '#E0E0E0',
    borderRadius: '0.125rem',
    margin: '0.75rem auto'
  } as StyleObject,
  issueImage: {
    width: "100%",
    borderRadius: "1.875rem",
    marginBottom: "1.5rem",
    aspectRatio: "3/2",
    objectFit: "cover",
    backgroundColor: "#F7F7F7"
  } as StyleObject,
  heading: {
    fontSize: "2rem",
    fontWeight: "700",
    lineHeight: "1.2",
    marginBottom: "1rem"
  } as StyleObject,
  metadata: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    fontSize: "0.9375rem",
    color: "#787575"
  } as StyleObject,
  description: {
    fontSize: "1.25rem",
    lineHeight: "1.5",
    color: "#333",
    marginBottom: "2rem"
  } as StyleObject,
  infoBlock: {
    backgroundColor: "#F7F7F7",
    borderRadius: "1.875rem",
    padding: "1.5rem",
    marginBottom: "1.5rem"
  } as StyleObject,
  infoHeading: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1rem"
  } as StyleObject,
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem"
  } as StyleObject,
  infoLabel: {
    color: "#787575"
  } as StyleObject,
  infoValue: {
    fontWeight: "500"
  } as StyleObject,
  severityTag: (severity: string) => ({
    display: "inline-block",
    borderRadius: "1.875rem",
    padding: "0.5rem 1rem",
    fontSize: "0.9375rem",
    fontWeight: "500",
    backgroundColor:
      severity === "high" ? "#FE7A71" :
      severity === "medium" ? "#F7F7E6" :
      "#E6F0FF",
    color:
      severity === "high" ? "white" :
      severity === "medium" ? "#728019" :
      "#075CDD"
  }) as SeverityTagStyle,
  statusBlock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    backgroundColor: "#F7F7F7",
    borderRadius: "1.875rem",
    marginBottom: "1.5rem"
  } as StyleObject,
  statusLabel: {
    fontSize: "1rem",
    fontWeight: "500"
  } as StyleObject,
  statusValue: (status: string) => ({
    color: status === "Resolved" ? "#3B7B3B" : "#FE7A71",
    fontWeight: "600"
  }) as StyleObject,
  commentsSection: {
    marginTop: "2rem"
  } as StyleObject,
  commentHeading: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1rem"
  } as StyleObject,
  comment: {
    backgroundColor: "#F7F7F7",
    borderRadius: "1.25rem",
    padding: "1rem",
    marginBottom: "1rem"
  } as StyleObject,
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem"
  } as StyleObject,
  commentUser: {
    fontWeight: "500"
  } as StyleObject,
  commentDate: {
    fontSize: "0.875rem",
    color: "#787575"
  } as StyleObject,
  commentText: {
    fontSize: "1rem",
    lineHeight: "1.5"
  } as StyleObject,
  // Suggestions section styles
  suggestionsSection: {
    marginBottom: "2rem"
  } as StyleObject,
  suggestionsList: {
    listStyleType: "disc",
    paddingLeft: "1.5rem",
    color: "#333",
    fontSize: "1rem",
    lineHeight: "1.5",
    margin: 0
  } as StyleObject,
  suggestionItem: {
    marginBottom: "0.5rem"
  } as StyleObject,
  addCommentButton: {
    width: "100%",
    backgroundColor: "#075CDD",
    color: "white",
    padding: "0.75rem",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "1.25rem",
    border: "none",
    cursor: "pointer",
    marginTop: "1.5rem"
  } as StyleObject
};

// Mock data - In a real app, this would likely be fetched based on issueId
const issueData = {
  "1": {
    title: "Large burn mark on Central Park bench",
    category: "Burnings",
    date: "May 12, 2023",
    severity: "high",
    status: "Open",
    description: "A wooden bench near the central fountain in Central Park has a large burn mark, approximately 30cm in diameter...",
    location: "Central Park, near main fountain",
    reportedBy: "Anonymous",
    assignedTo: "Parks Department",
    comments: [
      { user: "City Staff", date: "May 13, 2023", text: "Report received, assigned to Parks Dept." },
      { user: "Parks Department", date: "May 14, 2023", text: "Inspection scheduled for May 15." }
    ]
  },
  "2": {
    title: "Graffiti on historical building",
    category: "Graffiti",
    date: "May 10, 2023",
    severity: "medium",
    status: "In Progress",
    description: "Large graffiti tags on the east wall of the old library...",
    location: "Old City Library, east wall",
    reportedBy: "John D.",
    assignedTo: "Urban Cleaning Division",
    comments: [
      { user: "Urban Cleaning", date: "May 11, 2023", text: "Cleanup scheduled for May 15." }
    ]
  },
  "3": {
    title: "Deep pothole on Main Street",
    category: "Road Damage",
    date: "May 7, 2023",
    severity: "high",
    status: "Resolved",
    description: "Deep pothole near Main St & Oak Ave intersection...",
    location: "Main Street and Oak Avenue",
    reportedBy: "Sarah M.",
    assignedTo: "Road Maintenance",
    comments: [
      { user: "Road Maintenance", date: "May 8, 2023", text: "Added to emergency repairs." },
      { user: "Road Maintenance", date: "May 10, 2023", text: "Repairs completed." },
      { user: "City Inspector", date: "May 11, 2023", text: "Inspection passed. Resolved." }
    ]
  },
  // Add other issue IDs as needed...
  "4": { title: "Placeholder Issue 4", category: "Traffic", date: "May 15, 2023", severity: "low", status: "Open", description: "Placeholder description.", location: "Unknown", reportedBy: "System", assignedTo: "Unassigned", comments: [] },
  "5": { title: "Placeholder Issue 5", category: "Burnings", date: "May 16, 2023", severity: "medium", status: "Open", description: "Placeholder description.", location: "Unknown", reportedBy: "System", assignedTo: "Unassigned", comments: [] },
  "6": { title: "Placeholder Issue 6", category: "Graffiti", date: "May 17, 2023", severity: "high", status: "Open", description: "Placeholder description.", location: "Unknown", reportedBy: "System", assignedTo: "Unassigned", comments: [] },
  "7": { title: "Placeholder Issue 7", category: "Road Damage", date: "May 18, 2023", severity: "medium", status: "Open", description: "Placeholder description.", location: "Unknown", reportedBy: "System", assignedTo: "Unassigned", comments: [] },
  "8": { title: "Placeholder Issue 8", category: "Traffic", date: "May 19, 2023", severity: "low", status: "Open", description: "Placeholder description.", location: "Unknown", reportedBy: "System", assignedTo: "Unassigned", comments: [] }
};


interface IssueDetailProps {
  issueId: string;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issueId }) => {
  // Get data for the current issue - use issueId prop
  const data = issueData[issueId as keyof typeof issueData] || issueData["1"]; // Fallback to issue 1 if ID not found

  // Basic check if data exists
  if (!data) {
    return <div style={styles.content}><p>Issue not found.</p></div>;
  }

  return (
    <div style={styles.sheetWrapper}>
      <div style={styles.dragHandle} />
      <div style={styles.content}>
      {/* Drag handle indicator (optional, can be part of modal) */}
      <div style={styles.headerBar} />

      {/* Issue image */}
      <img
        // Use a placeholder generation or actual image logic based on ID
        src={`https://via.placeholder.com/400x267.png?text=Issue+${issueId}`}
        alt={data.title}
        style={styles.issueImage}
      />

      {/* Issue title */}
      <h1 style={styles.heading}>{data.title}</h1>

      {/* Metadata */}
      <div style={styles.metadata}>
        <span>{data.category}</span>
        <span>{data.date}</span>
      </div>
      {/* Suggestions section */}
      <div style={styles.suggestionsSection}>
        <h2 style={styles.infoHeading}>Suggestions</h2>
        <ul style={styles.suggestionsList}>
          <li style={styles.suggestionItem}>Ensure personal safety around the area</li>
          <li style={styles.suggestionItem}>Report any updates to the assigned department</li>
          <li style={styles.suggestionItem}>Include photos for documentation</li>
        </ul>
      </div>

      {/* Severity indicator */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={styles.severityTag(data.severity)}>
          {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)} Severity
        </span>
      </div>

      {/* Status block */}
      <div style={styles.statusBlock}>
        <span style={styles.statusLabel}>Status</span>
        <span style={styles.statusValue(data.status)}>{data.status}</span>
      </div>

      {/* Description */}
      <p style={styles.description}>{data.description}</p>

      {/* Information block */}
      <div style={styles.infoBlock}>
        <h2 style={styles.infoHeading}>Issue Information</h2>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Location</span>
          <span style={styles.infoValue}>{data.location}</span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Reported by</span>
          <span style={styles.infoValue}>{data.reportedBy}</span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Assigned to</span>
          <span style={styles.infoValue}>{data.assignedTo}</span>
        </div>
      </div>

      {/* Comments section */}
      <div style={styles.commentsSection}>
        <h2 style={styles.commentHeading}>Comments ({data.comments.length})</h2>

        {data.comments.map((comment, index) => (
          <div key={index} style={styles.comment}>
            <div style={styles.commentHeader}>
              <span style={styles.commentUser}>{comment.user}</span>
              <span style={styles.commentDate}>{comment.date}</span>
            </div>
            <p style={styles.commentText}>{comment.text}</p>
          </div>
        ))}
        {data.comments.length === 0 && <p>No comments yet.</p>}
        {/* Add comment button */}
        <button style={styles.addCommentButton}>Add a Comment</button>
      </div>
      </div>
    </div>
  );
};

export default IssueDetail; 