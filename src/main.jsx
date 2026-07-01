import React from "react";
import { createRoot } from "react-dom/client";
import RiskAssessmentTool from "./App.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RiskAssessmentTool />);
