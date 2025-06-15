
import React from "react";
import ScraperForm from "./ScraperForm";

/**
 * Container for owning state for ScraperForm, forwards props down as needed.
 */
const ScraperFormContainer = ({
  setReport,
  setAnalyzedText,
  loading,
  setLoading,
}: {
  setReport: (val: string) => void;
  setAnalyzedText: (val: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}) => {
  // You can add more shared scraper state here if needed
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
