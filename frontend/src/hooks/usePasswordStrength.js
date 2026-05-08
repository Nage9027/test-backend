import { useCallback, useState } from "react";

const criteria = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
  { regex: /[^A-Za-z0-9]/, label: "One special character" },
];

export default function usePasswordStrength() {
  const [strength, setStrength] = useState({
    score: 0,
    level: "weak",
    percent: 0,
    label: "Weak",
  });
  const [feedback, setFeedback] = useState([]);

  const checkStrength = useCallback((password) => {
    if (!password) {
      setStrength({ score: 0, level: "weak", percent: 0, label: "Weak" });
      setFeedback([]);
      return;
    }

    let score = 0;
    const unmet = [];

    criteria.forEach((criterion) => {
      if (criterion.regex.test(password)) score += 1;
      else unmet.push(criterion.label);
    });

    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    score = Math.min(score, criteria.length + 2);

    let level = "weak";
    let label = "Weak";
    let percent = 25;

    if (score <= 2) {
      level = "weak";
      label = "Weak";
      percent = 25;
    } else if (score <= 4) {
      level = "fair";
      label = "Fair";
      percent = 50;
    } else if (score <= 6) {
      level = "good";
      label = "Good";
      percent = 75;
    } else {
      level = "strong";
      label = "Strong";
      percent = 100;
    }

    setStrength({ score, level, percent, label });
    setFeedback(unmet.slice(0, 3));
  }, []);

  return { strength, feedback, checkStrength };
}
