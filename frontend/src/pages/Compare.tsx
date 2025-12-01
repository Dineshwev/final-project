import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScaleIcon } from "@heroicons/react/24/outline";
import ComparisonTable from "../components/compare/ComparisonTable";
import ComparisonReportButton from "../components/compare/ComparisonReportButton";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import { FaPlus, FaChartBar } from "../components/Icons";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3003/api";

const ComparePage: React.FC = () => {
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const updateUrl = (i: number, value: string) => {
    setUrls((prev) => prev.map((u, idx) => (idx === i ? value : u)));
  };

  const addField = () => {
    if (urls.length < 3) setUrls((prev) => [...prev, ""]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const active = urls.filter((u) => u.trim().length > 0);
    if (active.length < 2) {
      setError("Please provide at least 2 URLs");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: active }),
      });
      const json = await res.json();
      if (json.status !== "success")
        throw new Error(json.message || "Compare failed");
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Competitor Comparison"
      subtitle="Analyze performance, SEO, and content metrics side-by-side"
      icon={<ScaleIcon className="w-8 h-8" />}
      maxWidth="7xl"
    >
      <motion.div variants={fadeIn}>
        <Card variant="glass" padding="lg">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-4">
              {urls.map((u, i) => (
                <Input
                  key={i}
                  type="url"
                  required={i < 2}
                  value={u}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  placeholder={`https://competitor${i + 1}.com`}
                  label={`Website ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={urls.length >= 3}
                onClick={addField}
                icon={<FaPlus />}
              >
                Add URL
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                icon={<FaChartBar />}
              >
                {loading ? "Comparing…" : "Compare"}
              </Button>
            </div>
            {error && (
              <Alert type="error" title="Comparison Error" message={error} />
            )}
          </form>
        </Card>
      </motion.div>

      {data && (
        <motion.div
          className="space-y-6 mt-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <ComparisonReportButton data={data} />
          </motion.div>

          <motion.div variants={staggerItem}>
            <ComparisonTable data={data} />
          </motion.div>

          {/* Keyword Overlap */}
          <motion.div variants={staggerItem}>
            <Card variant="glass" padding="lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FaChartBar className="text-blue-600" />
                Keyword Overlap
              </h2>

              {data.comparison.overlapAll.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No common keywords among all provided URLs.
                </p>
              )}

              {data.comparison.overlapAll.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Shared Across All
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.comparison.overlapAll.map((k: string) => (
                      <Badge key={k} variant="info">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.comparison.pairwise.map((p: any, i: number) => (
                  <Card key={i} variant="glass" padding="md">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                      Pair: {p.a} ↔ {p.b}
                    </div>
                    {p.overlap.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No overlap
                      </p>
                    )}
                    {p.overlap.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.overlap.map((k: string) => (
                          <Badge key={k} variant="info">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Use overlapping keywords to refine
                  your content strategy; add high-value gaps you see competitors
                  ranking for.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default ComparePage;
