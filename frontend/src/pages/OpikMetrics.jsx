import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Target,
  Activity,
  Eye,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ["#86efac", "#2dd4bf", "#a78bfa", "#f472b6"];

export default function OpikMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    fetchExperiments();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API}/opik/metrics`);
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperiments = async () => {
    try {
      const response = await axios.get(`${API}/opik/experiments`);
      setExperiments(response.data.experiments || []);
    } catch (error) {
      console.error("Error fetching experiments:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  const data = metrics || {
    total_traces: 0,
    avg_response_quality: 0,
    avg_relevance_score: 0,
    avg_safety_score: 0,
    recent_evaluations: [],
    experiment_results: []
  };

  // Prepare chart data
  const qualityTrendData = experiments.slice(0, 14).reverse().map(exp => ({
    date: exp.date?.slice(5) || "",
    quality: exp.avg_quality || 0,
    safety: exp.avg_safety || 0
  }));

  const contextDistribution = data.experiment_results?.map((result, index) => ({
    name: result.context || "general",
    value: result.trace_count || 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      data-testid="opik-metrics-page"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium flex items-center gap-3">
          <Eye className="w-8 h-8 text-primary" />
          Opik Observability
        </h1>
        <p className="text-muted-foreground mt-1">
          AI evaluation metrics, experiment tracking, and quality insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="total-traces">{data.total_traces}</p>
                <p className="text-sm text-muted-foreground">Total Traces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="avg-quality">
                  {data.avg_response_quality?.toFixed(1) || "0"}<span className="text-lg text-muted-foreground">/10</span>
                </p>
                <p className="text-sm text-muted-foreground">Avg Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="avg-relevance">
                  {data.avg_relevance_score?.toFixed(1) || "0"}<span className="text-lg text-muted-foreground">/10</span>
                </p>
                <p className="text-sm text-muted-foreground">Avg Relevance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/30 flex items-center justify-center">
                <Shield className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="avg-safety">
                  {data.avg_safety_score?.toFixed(1) || "0"}<span className="text-lg text-muted-foreground">/10</span>
                </p>
                <p className="text-sm text-muted-foreground">Avg Safety</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Trend Chart */}
        <Card className="glass-card rounded-3xl border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Quality & Safety Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {qualityTrendData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(15, 22, 18, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quality" 
                      stroke="#86efac" 
                      strokeWidth={2}
                      dot={{ fill: "#86efac" }}
                      name="Quality"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="safety" 
                      stroke="#a78bfa" 
                      strokeWidth={2}
                      dot={{ fill: "#a78bfa" }}
                      name="Safety"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No trend data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context Distribution */}
        <Card className="glass-card rounded-3xl border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-secondary" />
              Traces by Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contextDistribution.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contextDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contextDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(15, 22, 18, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute space-y-2">
                  {contextDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="capitalize">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No context data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experiment Results */}
      <Card className="glass-card rounded-3xl border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-accent" />
            Experiment Results by Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.experiment_results && data.experiment_results.length > 0 ? (
            <div className="space-y-4">
              {data.experiment_results.map((result, index) => (
                <div key={index} className="p-4 rounded-2xl bg-white/5" data-testid={`experiment-${index}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{result.context}</p>
                        <p className="text-sm text-muted-foreground">{result.trace_count} traces</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{result.avg_quality?.toFixed(1)}/10</p>
                      <p className="text-xs text-muted-foreground">Avg Quality</p>
                    </div>
                  </div>
                  <Progress value={result.avg_quality * 10} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No experiment results yet. Start chatting to generate data!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Evaluations */}
      <Card className="glass-card rounded-3xl border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Recent Evaluations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_evaluations && data.recent_evaluations.length > 0 ? (
            <div className="space-y-3">
              {data.recent_evaluations.slice(0, 5).map((evaluation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl bg-white/5 flex items-center justify-between"
                  data-testid={`evaluation-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      evaluation.quality_scores?.overall >= 7 
                        ? "bg-emerald-500/20" 
                        : "bg-amber-500/20"
                    }`}>
                      {evaluation.quality_scores?.overall >= 7 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{evaluation.context || "general"} context</p>
                      <p className="text-sm text-muted-foreground">
                        Trace: {evaluation.trace_id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">Quality: <span className="font-bold">{evaluation.quality_scores?.overall?.toFixed(1)}</span></p>
                      <p className="text-sm">Safety: <span className="font-bold">{evaluation.safety_scores?.safety_score}</span></p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      evaluation.safety_scores?.passed 
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {evaluation.safety_scores?.passed ? "Safe" : "Review"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No evaluations yet. Chat with the AI coach to generate metrics!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-2">About Opik Integration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This dashboard showcases Opik's LLM observability capabilities. Each AI response is automatically 
                evaluated using LLM-as-judge for quality, relevance, helpfulness, and safety. Experiment tracking 
                helps identify performance trends across different wellness contexts. User feedback further refines 
                the evaluation metrics for continuous improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
