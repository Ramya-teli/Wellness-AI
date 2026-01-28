import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp,
  Plus,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Sleep() {
  const [sleepLogs, setSleepLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sleep_time: "22:30",
    wake_time: "06:30",
    quality: 7,
    interruptions: 0,
    notes: ""
  });

  useEffect(() => {
    fetchSleepLogs();
    fetchAnalysis();
  }, []);

  const fetchSleepLogs = async () => {
    try {
      const response = await axios.get(`${API}/sleep/logs`);
      setSleepLogs(response.data);
    } catch (error) {
      console.error("Error fetching sleep logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const response = await axios.get(`${API}/sleep/analysis`);
      setAnalysis(response.data);
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/sleep/log`, formData);
      toast.success("Sleep logged successfully!");
      setDialogOpen(false);
      fetchSleepLogs();
      fetchAnalysis();
      setFormData({
        sleep_time: "22:30",
        wake_time: "06:30",
        quality: 7,
        interruptions: 0,
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to log sleep");
      console.error(error);
    }
  };

  const getQualityColor = (quality) => {
    if (quality >= 8) return "text-emerald-400 bg-emerald-500/20";
    if (quality >= 6) return "text-amber-400 bg-amber-500/20";
    return "text-red-400 bg-red-500/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      data-testid="sleep-page"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Sleep Coach</h1>
          <p className="text-muted-foreground mt-1">Track your sleep patterns and get AI-powered insights</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full glow-secondary" data-testid="log-sleep-btn">
              <Plus className="w-4 h-4 mr-2" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-3xl">
            <DialogHeader>
              <DialogTitle>Log Your Sleep</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Bedtime
                  </Label>
                  <Input
                    type="time"
                    value={formData.sleep_time}
                    onChange={(e) => setFormData({ ...formData, sleep_time: e.target.value })}
                    className="rounded-xl bg-white/5 border-white/10"
                    data-testid="sleep-time-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Wake Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.wake_time}
                    onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                    className="rounded-xl bg-white/5 border-white/10"
                    data-testid="wake-time-input"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Sleep Quality: {formData.quality}/10</Label>
                <Slider
                  value={[formData.quality]}
                  onValueChange={(value) => setFormData({ ...formData, quality: value[0] })}
                  max={10}
                  min={1}
                  step={1}
                  data-testid="quality-slider"
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Interruptions</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.interruptions}
                  onChange={(e) => setFormData({ ...formData, interruptions: parseInt(e.target.value) || 0 })}
                  className="rounded-xl bg-white/5 border-white/10"
                  data-testid="interruptions-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dreams, how you felt..."
                  className="rounded-xl bg-white/5 border-white/10"
                  data-testid="sleep-notes-input"
                />
              </div>

              <Button type="submit" className="w-full rounded-full" data-testid="submit-sleep-btn">
                Save Sleep Log
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sleep Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center">
                <Clock className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="avg-duration">
                  {analysis?.avg_duration?.toFixed(1) || "0"}h
                </p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="avg-quality">
                  {analysis?.avg_quality?.toFixed(1) || "0"}/10
                </p>
                <p className="text-sm text-muted-foreground">Avg Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <Moon className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="total-logs">{sleepLogs.length}</p>
                <p className="text-sm text-muted-foreground">Nights Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      <Card className="glass-card rounded-3xl border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            AI Sleep Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5" data-testid="sleep-analysis">
                <p className="text-muted-foreground leading-relaxed">{analysis.analysis}</p>
              </div>
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Log some sleep data to get personalized insights
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sleep History */}
      <div>
        <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Sleep History
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : sleepLogs.length > 0 ? (
          <div className="space-y-3">
            {sleepLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card rounded-2xl border-white/5" data-testid={`sleep-log-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                          <Moon className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium">{log.duration_hours}h sleep</p>
                          <p className="text-sm text-muted-foreground">
                            {log.sleep_time} → {log.wake_time} • {log.interruptions} interruptions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm px-3 py-1 rounded-full ${getQualityColor(log.quality)}`}>
                          {log.quality}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass-card rounded-3xl border-white/5">
            <CardContent className="p-12 text-center">
              <Moon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sleep logs yet. Start tracking your sleep!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
