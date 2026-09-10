import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import MedicalRecords from "./MedicalRecords";
import "./medical-records.css";
import { chatWithAiWorkerHistory, completeEncounter, getAiWorkerHistorySummary, getDoctorEncounter } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const cleanAiText = (text = "") => text
  .replace(/\\?\*\*/g, "")
  .replace(/\\?\*/g, "")
  .replace(/<[^>]*>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/^\s*[-•]\s*/gm, "• ")
  .trim();

const suggestedQuestions = [
  "What previous conditions should I be aware of?",
  "Explain the worker's previous diagnoses in simple terms.",
  "What treatments and medicines were used previously?",
  "Are there any recurring symptoms or conditions in the records?",
];

const Encounter = () => {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false); const [aiLoading, setAiLoading] = useState(false); const [aiSummary, setAiSummary] = useState(null); const [aiError, setAiError] = useState("");
  const [chatOpen, setChatOpen] = useState(false); const [chatInput, setChatInput] = useState(""); const [chatLoading, setChatLoading] = useState(false); const [chatError, setChatError] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", content: "I can help you review this worker's documented medical history. Ask about previous conditions, diagnoses, symptoms, treatments, prescriptions, or the timeline of previous visits." }]);

  const load = useCallback(async () => { try { setError(""); setLoading(true); setEncounter(await getDoctorEncounter(encounterId)); } catch (err) { setError(getApiError(err, "Unable to load this visit.")); } finally { setLoading(false); } }, [encounterId]);
  useEffect(() => { load(); }, [load]);
  const visitDate = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date()), []);

  const analyzeHistory = async () => { if (!encounter?.workerId) return; setAiLoading(true); setAiError(""); try { setAiSummary(await getAiWorkerHistorySummary(encounter.workerId)); } catch (err) { setAiError(getApiError(err, "Unable to load the history summary.")); } finally { setAiLoading(false); } };

  const sendChat = async (question = chatInput) => {
    const trimmed = question.trim();
    if (!trimmed || !encounter?.workerId || chatLoading) return;
    const nextMessages = [...chatMessages, { role: "user", content: trimmed }];
    setChatMessages(nextMessages); setChatInput(""); setChatLoading(true); setChatError("");
    try {
      const response = await chatWithAiWorkerHistory(encounter.workerId, trimmed, nextMessages.slice(-12));
      setChatMessages((current) => [...current, { role: "assistant", content: response.answer }]);
    } catch (err) {
      setChatError(getApiError(err, "Unable to get an answer from the AI assistant."));
    } finally { setChatLoading(false); }
  };

  const finish = async () => { if (encounter?.status !== "ACTIVE") return; if (!window.confirm("Complete this visit? Make sure all clinical information is saved.")) return; setCompleting(true); setError(""); try { await completeEncounter(encounterId); navigate("/doctor/workers", { replace: true }); } catch (err) { setError(getApiError(err, "Unable to complete the visit.")); } finally { setCompleting(false); } };

  return <RoleLayout title="Visit details" description={encounter ? `${encounter.workerName} · ${encounter.hospitalName}` : "Current visit"} actions={[{ label: "Refresh", onClick: load, variant: "secondary", disabled: loading }, { label: "Back", onClick: () => navigate("/doctor/workers"), variant: "secondary" }]}>
    {loading && !encounter && <div className="loading-card">Loading visit…</div>}
    {error && <div className="alert error" role="alert">{error}</div>}
    {encounter && <>
      <div className="card worker-profile-header"><div className="person-cell"><span className="avatar">{(encounter.workerName || "W").charAt(0)}</span><div><span className="eyebrow">{encounter.workerCode}</span><h2>{encounter.workerName}</h2><p>{encounter.hospitalName}</p></div></div><span className={`status-badge ${encounter.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>{encounter.status}</span></div>
      <div className="profile-grid"><div><small>Started</small><strong>{new Date(encounter.startedAt).toLocaleString()}</strong></div><div><small>Visit date</small><strong>{visitDate}</strong></div><div><small>Doctor</small><strong>{encounter.doctorName}</strong></div><div><small>Hospital</small><strong>{encounter.hospitalName}</strong></div></div>
      {encounter.status === "ACTIVE" ? <>
        <div className="panel ai-history-panel">
          <div className="section-toolbar"><div><span className="eyebrow">Clinical assistant</span><h2>AI history review</h2><p>Review the worker's documented history or ask a question about their records.</p></div><div className="ai-actions"><button className="button button-secondary" type="button" onClick={() => setChatOpen((open) => !open)}>{chatOpen ? "Hide AI chat" : "Ask AI"}</button><button className="button button-primary" type="button" onClick={analyzeHistory} disabled={aiLoading}>{aiLoading ? "Loading…" : aiSummary ? "Refresh summary" : "Generate summary"}</button></div></div>
          {aiError && <div className="alert error">{aiError}</div>}
          {aiSummary && <div className="ai-summary"><div className="ai-summary-content">{cleanAiText(aiSummary.summary).split(/\n+/).map((line, index) => line.trim() ? <p key={`${index}-${line.slice(0, 12)}`}>{line.trim()}</p> : null)}</div><small>{aiSummary.recordsAnalyzed} record{aiSummary.recordsAnalyzed === 1 ? "" : "s"} reviewed · Verify with the original record.</small></div>}
          {chatOpen && <div className="ai-chat">
            <div className="ai-chat-header"><div><strong>Ask about this worker</strong><span>Answers are grounded in the worker's available records.</span></div><span className="ai-chat-badge">AI</span></div>
            <div className="ai-chat-suggestions">{suggestedQuestions.map((question) => <button key={question} type="button" className="ai-chat-suggestion" onClick={() => sendChat(question)} disabled={chatLoading}>{question}</button>)}</div>
            <div className="ai-chat-messages" aria-live="polite">{chatMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`ai-chat-message ${message.role}`}><span className="ai-chat-role">{message.role === "assistant" ? "Clinical AI" : "You"}</span><div>{cleanAiText(message.content).split(/\n+/).map((line, lineIndex) => line.trim() ? <p key={`${index}-${lineIndex}`}>{line.trim()}</p> : null)}</div></div>)}{chatLoading && <div className="ai-chat-message assistant"><span className="ai-chat-role">Clinical AI</span><div><p className="ai-chat-typing">Reviewing the worker's records…</p></div></div>}</div>
            {chatError && <div className="alert error">{chatError}</div>}
            <form className="ai-chat-composer" onSubmit={(event) => { event.preventDefault(); sendChat(); }}><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about previous conditions, diagnoses, treatments, or prescriptions…" rows={2} disabled={chatLoading} /><button className="button button-primary" type="submit" disabled={!chatInput.trim() || chatLoading}>{chatLoading ? "Thinking…" : "Send"}</button></form>
            <small className="ai-chat-disclaimer">AI assistance is for record review only. Verify important clinical decisions against the original medical record.</small>
          </div>}
        </div>
        <MedicalRecords workerId={String(encounter.workerId)} encounterId={String(encounter.id)} />
        <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Finish</span><h2>Complete visit</h2><p>Save changes before completing.</p></div><button className="button button-primary" type="button" onClick={finish} disabled={completing}>{completing ? "Completing…" : "Complete visit"}</button></div></div>
      </> : <div className="empty-state-card"><h3>Visit completed</h3><p>This visit is closed and can no longer be edited.</p><button className="button button-secondary" type="button" onClick={() => navigate("/doctor/workers")}>Back to active visits</button></div>}
    </>}
  </RoleLayout>;
};
export default Encounter;
