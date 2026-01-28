import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Zap,
  Plus,
  TrendingUp,
  Sparkles
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

const workoutTypes = [
  "Strength Training",
  "Cardio",
  "HIIT",
  "Yoga",
  "Pilates",
  "Swimming",
  "Running",
  "Cycling",
  "Walking",
  "Stretching",
  "Other"
];

export default function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    workout_type: "",
    duration_minutes: 30,
    intensity: "medium",
    energy_level: 5,
    notes: ""
  });

  useEffect(() => {
    fetchWorkouts();
    fetchRecommendations(5);
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API}/workout/logs`);
      setWorkouts(response.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (energy) => {
    try {
      const response = await axios.get(`${API}/workout/recommendations?energy_level=${energy}`);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleEnergyChange = (value) => {
    setEnergyLevel(value);
    fetchRecommendations(value[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/workout/log`, {
        ...formData,
        energy_level: energyLevel[0]
      });
      toast.success("Workout logged successfully!");
      setDialogOpen(false);
      fetchWorkouts();
      setFormData({
        workout_type: "",
        duration_minutes: 30,
        intensity: "medium",
        energy_level: 5,
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to log workout");
      console.error(error);
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case "low": return "text-emerald-400 bg-emerald-500/20";
      case "medium": return "text-amber-400 bg-amber-500/20";
      case "high": return "text-red-400 bg-red-500/20";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      data-testid="workout-page"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Workout Planner</h1>
          <p className="text-muted-foreground mt-1">Track your fitness journey and get AI recommendations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full glow-primary" data-testid="log-workout-btn">
              <Plus className="w-4 h-4 mr-2" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-3xl">
            <DialogHeader>
              <DialogTitle>Log Your Workout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select
                  value={formData.workout_type}
                  onValueChange={(value) => setFormData({ ...formData, workout_type: value })}
                >
                  <SelectTrigger className="rounded-xl bg-white/5 border-white/10" data-testid="workout-type-select">
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  data-testid="duration-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Intensity</Label>
                <Select
                  value={formData.intensity}
                  onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                >
                  <SelectTrigger className="rounded-xl bg-white/5 border-white/10" data-testid="intensity-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How did you feel?"
                  className="rounded-xl bg-white/5 border-white/10"
                  data-testid="notes-input"
                />
              </div>

              <Button type="submit" className="w-full rounded-full" data-testid="submit-workout-btn">
                Save Workout
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Energy Level Slider */}
      <Card className="glass-card rounded-3xl border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            How's your energy today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Low Energy</span>
              <span className="text-2xl font-bold text-foreground">{energyLevel[0]}</span>
              <span>High Energy</span>
            </div>
            <Slider
              value={energyLevel}
              onValueChange={handleEnergyChange}
              max={10}
              min={1}
              step={1}
              className="w-full"
              data-testid="energy-slider"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div>
        <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Workout Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card rounded-3xl border-white/5 hover:border-primary/30 transition-all cursor-pointer" data-testid={`recommendation-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">{rec.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getIntensityColor(rec.intensity)}`}>
                      {rec.intensity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {rec.duration} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workout History */}
      <div>
        <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recent Workouts
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card rounded-2xl border-white/5" data-testid={`workout-history-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{workout.workout_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.duration_minutes} min • Energy: {workout.energy_level}/10
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${getIntensityColor(workout.intensity)}`}>
                          {workout.intensity}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-medium">{workout.calories_burned}</span>
                        </div>
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
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workouts logged yet. Start your fitness journey!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
