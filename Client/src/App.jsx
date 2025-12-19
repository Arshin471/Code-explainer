import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import ReactMarkdown from "react-markdown";
import Editor from "@monaco-editor/react";


function App() {
  const [codeInput, setCodeInput] = useState("// Write your code here...");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("javascript");

  const [theme, setTheme] = useState("light");
  const [copied, setCopied] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const handleCopy = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        editor.updateOptions({
            fontSize: 14,
            minimap: { enabled: true },
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            parameterHints: {
                enabled: true
            },
            suggestSelection: "first",
            acceptSuggestionOnEnter: "on",
        });
    };

    const handleEditorChange = (value) => {
        setCodeInput(value || "");
    };
    const handleExplain = async () => {
        setLoading(true);

        const API = import.meta.env.VITE_API_BASE_URL;

        try {
            const res = await axios.post(
                `${API}/api/explain/code`,
                { code: codeInput },
                { headers: { "Content-Type": "application/json" } }
            );

            setResponse(
                res.data?.output ||
                res.data?.explanation ||
                "⚠ No explanation returned"
            );

        } catch (error) {
            console.error("Error:", error);
            setResponse("⚠ Error: Failed to get AI response");
        } finally {
            setLoading(false);
        }
    };



    const languages = [
        { value: "javascript", label: "JavaScript" },
        { value: "typescript", label: "TypeScript" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "csharp", label: "C#" },
        { value: "html", label: "HTML" },
        { value: "css", label: "CSS" },
        { value: "json", label: "JSON" },
        { value: "php", label: "PHP" },
        { value: "go", label: "Go" },
        { value: "rust", label: "Rust" },
        { value: "sql", label: "SQL" },
    ];

    return (
        <div className="wrapper">
            {/* <div className="topbar">
                <div className="logo">⚡ Code Explainer IDE</div>
                <div style={{ display: "flex", gap: "19px" }}>
                    <button className='btn'>
                        <a href="/" style={{ color: "white", textDecoration: "none", display: "flex", width: "100%", height: "100%" }}>
                            Home
                        </a>
                    </button>
                </div>
            </div> */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === "light" ? "🌙" : "☀️"}
                </button>

                <button className="btn">
                    <a
                        href="/"
                        style={{ color: "white", textDecoration: "none" }}
                    >
                        Home
                    </a>
                </button>
            </div>


            <div className="card-container">
                <div className="input-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div className="subtitle">Code Editor</div>
                        <select
                            className="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {languages.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="editor-wrapper">
                        <Editor
                            height="500px"
                            language={language}
                            value={codeInput}
                            theme="vs-dark"
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            options={{
                                selectOnLineNumbers: true,
                                roundedSelection: false,
                                readOnly: false,
                                cursorStyle: 'line',
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    <button
                        className="btn"
                        onClick={handleExplain}
                        disabled={loading || !codeInput.trim()}
                    >
                        {loading ? "⏳ thinking..." : "Explain Code"}
                    </button>
                </div>

                <div className="output-card">
                    <div className="subtitle">AI Explanation</div>
                    <button className="copy-btn" onClick={handleCopy}>
                        {copied ? "✅ Copied" : "📋 Copy"}
                    </button>
                    <div className="explanation-output">
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;