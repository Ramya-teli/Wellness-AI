import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  Clock, 
  TrendingUp,
  Plus,
  Sparkles,
  Play,
  Wind
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const sessionTypes = [
  { value: "guided", label: "Guided Meditation" },
  { value: "breathing", label: "Breathing Exercise" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "body_scan", label: "Body Scan" }
];

export default function Meditation() {
  const [meditations, setMeditations] = useState([]);
  const [guidedSession, setGuidedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSession, setGeneratingSession] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState([5]);
  const [sessionDuration, setSessionDuration] = useState([10]);
  const [formData, setFormData] = useState({
    session_type: "guided",
    duration_minutes: 10,
    mood_before: 5,
    mood_after: 7,
    stress_level: 5,
    focus_quality: 7,
    notes: ""
  });

  useEffect(() => {
    fetchMeditations();
  }, []);

  const fetchMeditations = async () => {
    try {
      const response = await axios.get(`${API}/meditation/logs`);
      setMeditations(response.data);
    } catch (error) {
      console.error("Error fetching meditations:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSession = async () => {
    setGeneratingSession(true);
    try {
      const response = await axios.get(
        `${API}/meditation/guided?mood=${currentMood[0]}&duration=${sessionDuration[0]}`
      );
      setGuidedSession(response.data);
      setSessionDialogOpen(true);
    } catch (error) {
      toast.error("Failed to generate meditation session");
      console.error(error);
    } finally {
      setGeneratingSession(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/meditation/log`, formData);
      toast.success("Meditation logged successfully!");
      setDialogOpen(false);
      fetchMeditations();
      setFormData({
        session_type: "guided",
        duration_minutes: 10,
        mood_before: 5,
        mood_after: 7,
        stress_level: 5,
        focus_quality: 7,
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to log meditation");
      console.error(error);
    }
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    return "😔";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      data-testid="meditation-page"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Meditation Center</h1>
          <p className="text-muted-foreground mt-1">Find your calm with AI-guided meditation sessions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full glow-accent" data-testid="log-meditation-btn">
              <Plus className="w-4 h-4 mr-2" />
              Log Session
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-3xl max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Meditation Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select
                  value={formData.session_type}
                  onValueChange={(value) => setFormData({ ...formData, session_type: value })}
                >
                  <SelectTrigger className="rounded-xl bg-white/5 border-white/10" data-testid="session-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="rounded-xl bg-white/5 border-white/10"
                  data-testid="meditation-duration-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mood Before: {formData.mood_before}</Label>
                  <Slider
                    value={[formData.mood_before]}
                    onValueChange={(value) => setFormData({ ...formData, mood_before: value[0] })}
                    max={10}
                    min={1}
                    data-testid="mood-before-slider"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mood After: {formData.mood_after}</Label>
                  <Slider
                    value={[formData.mood_after]}
                    onValueChange={(value) => setFormData({ ...formData, mood_after: value[0] })}
                    max={10}
                    min={1}
                    data-testid="mood-after-slider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stress Level: {formData.stress_level}</Label>
                  <Slider
                    value={[formData.stress_level]}
                    onValueChange={(value) => setFormData({ ...formData, stress_level: value[0] })}
                    max={10}
                    min={1}
                    data-testid="stress-level-slider"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Quality: {formData.focus_quality}</Label>
                  <Slider
                    value={[formData.focus_quality]}
                    onValueChange={(value) => setFormData({ ...formData, focus_quality: value[0] })}
                    max={10}
                    min={1}
                    data-testid="focus-quality-slider"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How did the session feel?"
                  className="rounded-xl bg-white/5 border-white/10"
                  data-testid="meditation-notes-input"
                />
              </div>

              <Button type="submit" className="w-full rounded-full" data-testid="submit-meditation-btn">
                Save Session
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Guided Session Generator */}
      <Card className="glass-card rounded-3xl border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Meditation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>How are you feeling? {getMoodEmoji(currentMood[0])}</Label>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Stressed</span>
                <span className="text-lg font-bold text-foreground">{currentMood[0]}</span>
                <span>Calm</span>
              </div>
              <Slider
                value={currentMood}
                onValueChange={setCurrentMood}
                max={10}
                min={1}
                data-testid="current-mood-slider"
              />
            </div>
            <div className="space-y-4">
              <Label>Session Duration</Label>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>5 min</span>
                <span className="text-lg font-bold text-foreground">{sessionDuration[0]} min</span>
                <span>30 min</span>
              </div>
              <Slider
                value={sessionDuration}
                onValueChange={setSessionDuration}
                max={30}
                min={5}
                step={5}
                data-testid="session-duration-slider"
              />
            </div>
          </div>
          <Button 
            onClick={generateSession}
            disabled={generatingSession}
            className="w-full md:w-auto rounded-full glow-accent"
            data-testid="generate-session-btn"
          >
            {generatingSession ? (
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Meditation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Guided Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="glass-card border-white/10 rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-accent" />
              Your Guided Meditation
            </DialogTitle>
          </DialogHeader>
          {guidedSession && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {guidedSession.duration_minutes} minutes
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Mood level: {guidedSession.mood_level}
                </span>
              </div>
              <div 
                className="p-6 rounded-2xl bg-white/5 prose prose-invert max-w-none"
                data-testid="meditation-script"
              >
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {guidedSession.meditation_script}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Session Cards */}
      <div>
        <h2 className="text-xl font-medium mb-4">Quick Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sessionTypes.map((type, index) => (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="glass-card rounded-3xl border-white/5 hover:border-accent/30 transition-all cursor-pointer"
                data-testid={`session-card-${type.value}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-medium mb-1">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">5-15 min</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Meditation History */}
      <div>
        <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Session History
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : meditations.length > 0 ? (
          <div className="space-y-3">
            {meditations.map((meditation, index) => (
              <motion.div
                key={meditation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card rounded-2xl border-white/5" data-testid={`meditation-log-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                          <Brain className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{meditation.session_type.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {meditation.duration_minutes} min • Stress: {meditation.stress_level}/10
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {getMoodEmoji(meditation.mood_before)} → {getMoodEmoji(meditation.mood_after)}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          meditation.mood_after > meditation.mood_before 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {meditation.mood_after > meditation.mood_before ? '+' : ''}{meditation.mood_after - meditation.mood_before}
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
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No meditation sessions yet. Start your mindfulness journey!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
