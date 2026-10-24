import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

const API = 'http://localhost:8081/api';

const mcqQuestions = [
  {
    question: 'Which keyword is used to inherit a class in Java?',
    options: ['implements', 'extends', 'inherits', 'super'],
    correct: 1,
    explanation: 'Java uses extends when one class inherits another class.',
  },
  {
    question: 'Which method is the entry point of a Java program?',
    options: ['start()', 'run()', 'main()', 'init()'],
    correct: 2,
    explanation: 'Execution starts from the main method.',
  },
  {
    question: 'Which data type stores true or false?',
    options: ['int', 'String', 'char', 'boolean'],
    correct: 3,
    explanation: 'The boolean type stores true or false.',
  },
  {
    question: 'Which keyword creates an object in Java?',
    options: ['class', 'new', 'this', 'void'],
    correct: 1,
    explanation: 'The new keyword creates an object.',
  },
  {
    question: 'Which concept hides internal implementation details?',
    options: ['Inheritance', 'Looping', 'Abstraction', 'Compilation'],
    correct: 2,
    explanation: 'Abstraction hides implementation details.',
  },
];

const codingQuestions = [
  {
    id: 'add',
    title: '1. Add Two Numbers',
    description: 'Read two integers and print their sum.',
    input: '10 20',
    output: '30',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
        sc.close();
    }
}`,
  },
  {
    id: 'even',
    title: '2. Even or Odd',
    description: 'Read an integer. Print Even or Odd.',
    input: '7',
    output: 'Odd',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // Write your solution here

        sc.close();
    }
}`,
  },
  {
    id: 'largest',
    title: '3. Largest of Three Numbers',
    description: 'Read three integers and print the largest.',
    input: '10 20 5',
    output: '20',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        // Write your solution here

        sc.close();
    }
}`,
  },
  {
    id: 'reverse',
    title: '4. Reverse a String',
    description: 'Read one word and print it in reverse.',
    input: 'hello',
    output: 'olleh',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String text = sc.next();

        // Write your solution here

        sc.close();
    }
}`,
  },
  {
    id: 'prime',
    title: '5. Prime Number',
    description: 'Print Prime or Not Prime.',
    input: '7',
    output: 'Prime',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // Write your solution here

        sc.close();
    }
}`,
  },
];

export default function App() {
  const [page, setPage] = useState('home');
  const [role, setRole] = useState('student');
  const [backendMessage, setBackendMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState({});
  const [mcqIndex, setMcqIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [mcqResults, setMcqResults] = useState(null);

  const [codingIndex, setCodingIndex] = useState(0);
  const [codeAnswers, setCodeAnswers] = useState(
    Object.fromEntries(codingQuestions.map((q) => [q.id, q.starterCode]))
  );
  const [codeInput, setCodeInput] = useState('10 20');
  const [codeOutput, setCodeOutput] = useState('');
  const [codingResults, setCodingResults] = useState({});
  const [codingSummary, setCodingSummary] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const currentQuestion = codingQuestions[codingIndex];
  const currentCode = codeAnswers[currentQuestion.id];

  useEffect(() => {
    if (page !== 'questions') return undefined;
    if (timeLeft <= 0) {
      finishMcqTest();
      return undefined;
    }
    const timer = setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [page, timeLeft]);

  useEffect(() => {
    setCodeInput(currentQuestion.input);
    setCodeOutput('');
  }, [codingIndex]);

  async function testBackend() {
    setLoading(true);
    setBackendMessage('');
    try {
      const response = await fetch(`${API}/test`);
      const data = await response.text();
      if (!response.ok) throw new Error(data || 'Backend request failed.');
      setBackendMessage(data);
    } catch {
      setBackendMessage(
        'Backend connection failed. Check that Spring Boot is running on port 8081.'
      );
    } finally {
      setLoading(false);
    }
  }

  function startMcqTest() {
    setAnswers({});
    setMcqIndex(0);
    setMcqResults(null);
    setTimeLeft(300);
    setPage('questions');
  }

  function finishMcqTest() {
    let score = 0;
    mcqQuestions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    setMcqResults({
      score,
      total: mcqQuestions.length,
      percentage: (score / mcqQuestions.length) * 100,
      answers: { ...answers },
    });
    setPage('results');
  }
  async function runCode() {
    setLoading(true);
    setCodeOutput('');

    try {
      const response = await fetch(`${API}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          input: codeInput,
        }),
      });

      const data = await response.json();

if (!response.ok || data.error) {
  throw new Error(data.error || 'Code execution failed.');
}

setCodeOutput(data.output ?? 'No output received.');
    } catch (error) {
      setCodeOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function submitCodingQuestion() {
    setLoading(true);
    setCodeOutput('');

    try {
      const response = await fetch(`${API}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          questionId: currentQuestion.id,
        }),
      });

      const data = await response.json();
      console.log("Submit responce: ",data);
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }

      setCodingResults((previous) => ({
        ...previous,
        [currentQuestion.id]: data,
      }));

      if (data.error) {
  throw new Error(data.error);
     }

setCodeOutput(
  `Test cases passed: ${data.passed ?? 0}/${data.total ?? 0}\n` +
  `Percentage: ${data.percentage ?? 0}%`
);

    } catch (error) {
      setCodeOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function finishCodingTest() {
    const completedResults = { ...codingResults };
    const totalQuestions = codingQuestions.length;

    let passedQuestions = 0;
    let totalCases = 0;
    let passedCases = 0;

    codingQuestions.forEach((question) => {
      const result = completedResults[question.id];

      if (result) {
        totalCases += result.total;
        passedCases += result.passed;

        if (result.passed === result.total) {
          passedQuestions++;
        }
      }
    });

    setCodingSummary({
      passedQuestions,
      totalQuestions,
      totalCases,
      passedCases,
      percentage: totalCases
        ? Math.round((passedCases / totalCases) * 100)
        : 0,
      results: completedResults,
    });

    setPage('coding-results');
  }

  function changeCodingQuestion(index) {
    setCodingIndex(index);
    setCodeOutput('');
  }

  function handleAuth(event) {
    event.preventDefault();
    setAuthMessage(
      'Login/register UI is ready, but real account authentication is not connected yet.'
    );
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand" onClick={() => setPage('home')}>
          <span className="brand-icon">CA</span>
          <span>CodeAssess</span>
        </div>

        <nav>
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('login')}>Login</button>
        </nav>
      </header>

      <main className="main-content">
        {page === 'home' && (
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">ONLINE CODING ASSESSMENT</span>
              <h1>Practice. Code. <span>Achieve.</span></h1>
              <p>
                Test your Java fundamentals and solve coding challenges
                in one place.
              </p>

              <div className="hero-actions">
                <button className="primary-button" onClick={startMcqTest}>
                  Start MCQ Test
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setCodingIndex(0);
                
                    setCodingResults({});
                    setCodingSummary(null);
                    setCodeAnswers(
                      Object.fromEntries(
                        codingQuestions.map((question) => [
                          question.id,
                          question.starterCode,
                        ])
                      )
                    );
                    setPage('coding');
                  }}
                >
                  Start Coding Test
                </button>
              </div>

              <div className="backend-check">
                <button
                  className="secondary-button"
                  onClick={testBackend}
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Test Backend Connection'}
                </button>
                {backendMessage && <p>{backendMessage}</p>}
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-card-top">
                <span>Java Assessment</span>
                <span className="status-dot">● Ready</span>
              </div>
              <div className="hero-card-icon">&lt;/&gt;</div>
              <h2>Ready to test your skills?</h2>
              <p>5 MCQs · 5 coding challenges · Java</p>
              <div className="feature-list">
                <p>✓ Timed MCQ assessment</p>
                <p>✓ Online Java code editor</p>
                <p>✓ Automated test cases</p>
                <p>✓ Results and review</p>
              </div>
            </div>
          </section>
        )}

        {page === 'login' && (
          <section className="auth-card">
            <h1>Welcome to CodeAssess</h1>
            <p>Login or register UI</p>

            <form onSubmit={handleAuth}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />

              <label>Account type</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>

              <button className="primary-button" type="submit">
                Continue
              </button>
            </form>

            {authMessage && <p className="info-message">{authMessage}</p>}
          </section>
        )}

        {page === 'questions' && (
          <section className="test-card">
            <div className="test-topbar">
              <span>Java Fundamentals MCQ Test</span>
              <strong>Time left: {formatTime(timeLeft)}</strong>
            </div>

            <div className="question-progress">
              Question {mcqIndex + 1} of {mcqQuestions.length}
            </div>

            <h2>{mcqQuestions[mcqIndex].question}</h2>

            <div className="options-list">
              {mcqQuestions[mcqIndex].options.map((option, index) => (
                <label
                  className={`option-item ${
                    answers[mcqIndex] === index ? 'selected' : ''
                  }`}
                  key={option}
                >
                  <input
                    type="radio"
                    name={`question-${mcqIndex}`}
                    checked={answers[mcqIndex] === index}
                    onChange={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [mcqIndex]: index,
                      }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>

            <div className="test-actions">
              <button
                className="secondary-button"
                disabled={mcqIndex === 0}
                onClick={() => setMcqIndex((index) => index - 1)}
              >
                Previous
              </button>

              {mcqIndex < mcqQuestions.length - 1 ? (
                <button
                  className="primary-button"
                  onClick={() => setMcqIndex((index) => index + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  className="primary-button"
                  onClick={finishMcqTest}
                >
                  Submit MCQ Test
                </button>
              )}
            </div>
          </section>
        )}

        {page === 'results' && mcqResults && (
          <section className="results-card">
            <h1>MCQ Test Results</h1>
            <div className="score-panel">
              <strong>{mcqResults.score}/{mcqResults.total}</strong>
              <span>{mcqResults.percentage}%</span>
            </div>

            {mcqQuestions.map((question, index) => (
              <article className="review-item" key={question.question}>
                <h3>{index + 1}. {question.question}</h3>
                <p>
                  Your answer:{' '}
                  <strong>
                    {mcqResults.answers[index] === undefined
                      ? 'Not answered'
                      : question.options[mcqResults.answers[index]]}
                  </strong>
                </p>
                <p>
                  Correct answer:{' '}
                  <strong>{question.options[question.correct]}</strong>
                </p>
                <p>{question.explanation}</p>
              </article>
            ))}

            <button className="primary-button" onClick={() => setPage('home')}>
              Back to Home
            </button>
          </section>
        )}

        {page === 'coding' && (
          <section className="coding-layout">
            <aside className="coding-sidebar">
              <h2>Coding Test</h2>
              <p>Choose a question</p>

              {codingQuestions.map((question, index) => (
                <button
                  key={question.id}
                  className={`question-nav-button ${
                    codingIndex === index ? 'active' : ''
                  }`}
                  onClick={() => changeCodingQuestion(index)}
                >
                  {question.title}
                  {codingResults[question.id] && ' ✓'}
                </button>
              ))}

              <button
                className="secondary-button finish-coding-button"
                onClick={finishCodingTest}
              >
                Finish Test
              </button>
            </aside>

            <div className="coding-workspace">
              <div className="coding-question-panel">
                <h1>{currentQuestion.title}</h1>
                <p>{currentQuestion.description}</p>
                <h3>Sample Input</h3>
                <pre>{currentQuestion.input}</pre>
                <h3>Expected Output</h3>
                <pre>{currentQuestion.output}</pre>
              </div>

              <div className="editor-panel">
                <div className="editor-toolbar">
                  <span>Java · Main.java</span>
                  <span>Language: Java</span>
                </div>

                <Editor
                  height="380px"
                  language="java"
                  theme="vs-dark"
                  value={currentCode}
                  onChange={(value) =>
                    setCodeAnswers((previous) => ({
                      ...previous,
                      [currentQuestion.id]: value ?? '',
                    }))
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              <div className="coding-input-panel">
                <label>Custom Input</label>
                <textarea
                  rows={3}
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                  placeholder="Enter input for your code"
                />

                <div className="coding-actions">
                  <button
                    className="secondary-button"
                    disabled={loading}
                    onClick={runCode}
                  >
                    {loading ? 'Running...' : 'Run Code'}
                  </button>

                  <button
                    className="primary-button"
                    disabled={loading}
                    onClick={submitCodingQuestion}
                  >
                    {loading ? 'Submitting...' : 'Submit Code'}
                  </button>
                </div>

                <h3>Output / Submission Result</h3>
                <pre className="output-panel">
                  {codeOutput || 'Your output will appear here.'}
                </pre>
              </div>
            </div>
          </section>
        )}
        </main>

      {page === 'coding-results' && codingSummary && (
        <main className="main-content">
          <section className="results-card">
            <h1>Coding Test Results</h1>
            <p>Here is your final coding assessment summary.</p>

            <div className="score-panel">
              <strong>
                {codingSummary.passedCases}/{codingSummary.totalCases}
              </strong>
              <span>{codingSummary.percentage}%</span>
            </div>

            <div className="summary-stats">
              <div>
                <h3>{codingSummary.passedQuestions}</h3>
                <p>Questions fully passed</p>
              </div>
              <div>
                <h3>{codingSummary.passedCases}</h3>
                <p>Test cases passed</p>
              </div>
              <div>
                <h3>{codingSummary.totalCases - codingSummary.passedCases}</h3>
                <p>Test cases failed</p>
              </div>
            </div>

            {codingQuestions.map((question) => {
              const result = codingSummary.results[question.id];

              return (
                <article className="review-item" key={question.id}>
                  <h3>{question.title}</h3>

                  {!result ? (
                    <p>Not submitted.</p>
                  ) : (
                    <>
                      <p>
                        Passed: <strong>{result.passed}/{result.total}</strong>
                      </p>

                      {result.results?.map((testCase) => (
                        <div key={testCase.testCase} className="test-case-result">
                          <p>
                            Test case {testCase.testCase}:{' '}
                            <strong>
                              {testCase.passed ? 'Passed' : 'Failed'}
                            </strong>
                          </p>
                          <p>Expected: {testCase.expected}</p>
                          <p>Actual: {testCase.actual}</p>
                        </div>
                      ))}
                    </>
                  )}
                </article>
              );
            })}

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => setPage('home')}
              >
                Back to Home
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  setCodingIndex(0);
                  setCodingResults({});
                  setCodingSummary(null);
                  setCodeAnswers(
                    Object.fromEntries(
                      codingQuestions.map((question) => [
                        question.id,
                        question.starterCode,
                      ])
                    )
                  );
                  setPage('coding');
                }}
              >
                Try Again
              </button>
            </div>
          </section>
        </main>
      )}

      <footer className="app-footer">
        <p>© 2026 CodeAssess · Online Coding Assessment System</p>
      </footer>
    </div>
  );
} "$env:USERPROFILE\OneDrive\Desktop\OnlineCodeAssessmentSystem\backend"