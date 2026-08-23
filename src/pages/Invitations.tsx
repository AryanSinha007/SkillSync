import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Invitation {
  id: number;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender: {
    full_name: string;
    college: string;
    course: string;
    year: number;
  };
}

function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invitations")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!invitations_sender_id_fkey (
          full_name,
          college,
          course,
          year
        )
      `)
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setInvitations((data || []) as unknown as Invitation[]);
    setLoading(false);
  }

  async function respondToInvitation(
  invitationId: number,
  status: "accepted" | "rejected"
) {
  setProcessingId(invitationId);
  setError("");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setError("Please log in again.");
    setProcessingId(null);
    return;
  }

  if (status === "rejected") {
    const { error } = await supabase
      .from("invitations")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)
      .eq("receiver_id", user.id);

    if (error) {
      setError(error.message);
      setProcessingId(null);
      return;
    }

    setInvitations((current) =>
      current.filter(
        (item) => item.id !== invitationId
      )
    );

    setProcessingId(null);
    return;
  }

  // ACCEPT INVITATION

  const { data: teamId, error } =
    await supabase.rpc(
      "accept_team_invitation",
      {
        invitation_id: invitationId,
      }
    );

  if (error) {
    console.error(
      "Accept invitation error:",
      error
    );

    setError(error.message);
    setProcessingId(null);
    return;
  }

  console.log("Team created:", teamId);

  setInvitations((current) =>
    current.filter(
      (item) => item.id !== invitationId
    )
  );

  setProcessingId(null);
}

  if (loading) {
    return (
      <div className="auth-page">
        <p>Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="invitations-page">

      <header className="invitations-navbar">

        <Link to="/dashboard" className="logo">
          <span className="logo-mark">S</span>
          <span>SkillSync</span>
        </Link>

        <Link
          to="/dashboard"
          className="back-link"
        >
          ← Dashboard
        </Link>

      </header>

      <main className="invitations-container">

        <section className="invitations-heading">

          <span className="section-tag">
            TEAM INVITATIONS
          </span>

          <h1>
            Team requests
          </h1>

          <p>
            Students who want you to join their team
            will appear here.
          </p>

        </section>

        {error && (
          <p className="profile-error">
            {error}
          </p>
        )}

        {invitations.length === 0 ? (

          <div className="empty-invitations">

            <div className="empty-invitation-icon">
              ✓
            </div>

            <h2>
              No pending invitations
            </h2>

            <p>
              When someone invites you to their team,
              you'll see it here.
            </p>

            <Link
              to="/teammates"
              className="primary-button"
            >
              Find Teammates
            </Link>

          </div>

        ) : (

          <div className="invitations-list">

            {invitations.map((invitation) => (

              <article
                className="invitation-card"
                key={invitation.id}
              >

                <div className="invitation-avatar">
                  {invitation.sender?.full_name
                    ?.charAt(0)
                    .toUpperCase() || "S"}
                </div>

                <div className="invitation-content">

                  <span className="invitation-label">
                    TEAM INVITATION
                  </span>

                  <h2>
                    {invitation.sender?.full_name}
                    {" "}wants you on their team
                  </h2>

                  <p>
                    {invitation.sender?.college}
                    {" • "}
                    {invitation.sender?.course}
                    {" • Year "}
                    {invitation.sender?.year}
                  </p>

                  <span className="invitation-date">
                    Received{" "}
                    {new Date(
                      invitation.created_at
                    ).toLocaleDateString()}
                  </span>

                  <div className="invitation-actions">

                    <button
                      className="primary-button"
                      disabled={
                        processingId === invitation.id
                      }
                      onClick={() =>
                        respondToInvitation(
                          invitation.id,
                          "accepted"
                        )
                      }
                    >
                      {processingId === invitation.id
                        ? "Processing..."
                        : "Accept"}
                    </button>

                    <button
                      className="secondary-button"
                      disabled={
                        processingId === invitation.id
                      }
                      onClick={() =>
                        respondToInvitation(
                          invitation.id,
                          "rejected"
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Invitations;