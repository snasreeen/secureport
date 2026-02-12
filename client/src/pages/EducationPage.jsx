import React, { useState } from 'react';
import api from '../utils/apiClient.js';
import LegalBanner from '../components/LegalBanner.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const EducationPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAnswer('');
    setLoading(true);
    try {
      const res = await api.post('/ai/ask', { question });
      setAnswer(res.data.answer);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to process your question.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <LegalBanner />
      <section className="card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Defensive Cybersecurity Education</h2>
          <p className="text-xs text-gray-400">
            Ask high-level questions about ports, TCP, and defensive practices. Harmful or
            offensive prompts (e.g. &quot;exploit this port&quot; or &quot;hack this server&quot;)
            are rejected and responded to with a strict defensive-only message.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label" htmlFor="question">
              Educational Question
            </label>
            <textarea
              id="question"
              className="input min-h-[80px]"
              placeholder="Examples: What is port 22 used for? Why are open ports risky? What is the TCP handshake?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner label="Generating explanation..." /> : 'Ask'}
          </button>
        </form>
        {answer && (
          <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-gray-200">
            {answer}
          </div>
        )}
      </section>
    </div>
  );
};

export default EducationPage;

