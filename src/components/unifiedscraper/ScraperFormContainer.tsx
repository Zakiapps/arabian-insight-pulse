
import React from "react";
import ScraperForm from "./ScraperForm";

interface ScraperFormContainerProps {
  setReport: (val: string) => void;
  setAnalyzedText: (val: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

const ScraperFormContainer: React.FC<ScraperFormContainerProps> = ({
  setReport,
  setAnalyzedText,
  loading,
  setLoading,
}) => {
  return (
    <ScraperForm
      setReport={setReport}
      setAnalyzedText={setAnalyzedText}
      loading={loading}
      setLoading={setLoading}
    />
  );
};

export default ScraperFormContainer;
