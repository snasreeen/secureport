const HARMFUL_KEYWORDS = [
  'exploit',
  'hack',
  'bypass',
  'crack',
  'backdoor',
  'payload',
  'shellcode',
  'ddos',
  'botnet',
];

const DEFENSIVE_RESPONSE =
  'This platform supports defensive cybersecurity learning only. ' +
  'We cannot provide guidance on attacking, exploiting, or bypassing systems or defenses.';

const educationalAnswers = (question) => {
  const q = question.toLowerCase();

  if (q.includes('port 22')) {
    return (
      'Port 22 is commonly used by SSH (Secure Shell). ' +
      'It allows secure remote login and command execution. ' +
      'From a defensive perspective, you should restrict SSH access to trusted IPs, ' +
      'use strong authentication (keys instead of passwords), and monitor for unusual login attempts.'
    );
  }

  if (q.includes('tcp handshake') || q.includes('three-way handshake')) {
    return (
      'The TCP three-way handshake is the process used to establish a reliable connection: ' +
      '1) the client sends SYN, 2) the server replies with SYN-ACK, and 3) the client sends ACK. ' +
      'Understanding this helps defenders detect abnormal traffic patterns and incomplete handshakes ' +
      'that may indicate scanning or denial-of-service attempts.'
    );
  }

  if (q.includes('open ports risky') || q.includes('why are open ports')) {
    return (
      'Open ports expose network services that can be probed or misused if not properly secured. ' +
      'From a defensive standpoint, you should close unused ports, apply the principle of least privilege, ' +
      'use firewalls to restrict access, keep services patched, and regularly review which ports are reachable.'
    );
  }

  if (q.includes('port 80') || q.includes('port 443')) {
    return (
      'Ports 80 and 443 typically host web services (HTTP and HTTPS). ' +
      'Defensive best practices include enforcing HTTPS, using secure headers, ' +
      'regularly patching web servers and frameworks, and applying web application firewalls.'
    );
  }

  return (
    'This educational assistant focuses on defensive cybersecurity. ' +
    'You can ask about concepts like TCP, common ports, secure configuration, ' +
    'and how to reduce exposure of services. No offensive or exploit guidance is provided.'
  );
};

export const askEducationalQuestion = async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ message: 'A question is required.' });
  }

  const lowered = question.toLowerCase();
  const isHarmful = HARMFUL_KEYWORDS.some((kw) => lowered.includes(kw));

  if (isHarmful) {
    return res.json({ answer: DEFENSIVE_RESPONSE });
  }

  const answer = educationalAnswers(question);
  return res.json({ answer });
};

