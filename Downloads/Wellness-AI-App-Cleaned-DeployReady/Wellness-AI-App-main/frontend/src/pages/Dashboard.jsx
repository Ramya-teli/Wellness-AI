import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Moon, 
  Brain, 
  TrendingUp, 
  Calendar,
  Flame,
  Target,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
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

  const data = dashboardData || {
    wellness_score: 0,
    workout_streak: 0,
    meditation_streak: 0,
    avg_sleep_quality: 0,
    weekly_stats: { workouts: 0, meditations: 0, target_workouts: 5, target_meditations: 7 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      data-testid="dashboard-page"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
          Welcome to <span className="gradient-text">Wellness AI</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered companion for fitness, mindfulness, and better sleep
        </p>
      </motion.div>

      {/* Wellness Score */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card rounded-3xl border-white/5 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl font-bold gradient-text" data-testid="wellness-score">
                        {Math.round(data.wellness_score)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">Wellness Score</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Weekly Workouts</span>
                    <span className="text-sm font-medium">{data.weekly_stats.workouts}/{data.weekly_stats.target_workouts}</span>
                  </div>
                  <Progress value={(data.weekly_stats.workouts / data.weekly_stats.target_workouts) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Weekly Meditations</span>
                    <span className="text-sm font-medium">{data.weekly_stats.meditations}/{data.weekly_stats.target_meditations}</span>
                  </div>
                  <Progress value={(data.weekly_stats.meditations / data.weekly_stats.target_meditations) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Sleep Quality</span>
                    <span className="text-sm font-medium">{data.avg_sleep_quality}/10</span>
                  </div>
                  <Progress value={data.avg_sleep_quality * 10} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card rounded-3xl border-white/5 hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="workout-streak">{data.workout_streak}</p>
                <p className="text-sm text-muted-foreground">Workout Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5 hover:border-secondary/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center">
                <Brain className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="meditation-streak">{data.meditation_streak}</p>
                <p className="text-sm text-muted-foreground">Meditation Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl border-white/5 hover:border-accent/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center">
                <Moon className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="sleep-quality">{data.avg_sleep_quality.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Sleep Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-medium mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/workout" data-testid="quick-action-workout">
            <Card className="glass-card rounded-3xl border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  <span className="font-medium">Log Workout</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/sleep" data-testid="quick-action-sleep">
            <Card className="glass-card rounded-3xl border-white/5 hover:border-secondary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-secondary" />
                  <span className="font-medium">Log Sleep</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/meditation" data-testid="quick-action-meditation">
            <Card className="glass-card rounded-3xl border-white/5 hover:border-accent/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-accent" />
                  <span className="font-medium">Start Meditation</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat" data-testid="quick-action-chat">
            <Card className="glass-card rounded-3xl border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-medium">AI Coach</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card className="glass-card rounded-3xl border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Dumbbell className="w-5 h-5 text-primary" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent_workouts && data.recent_workouts.length > 0 ? (
              <div className="space-y-3">
                {data.recent_workouts.slice(0, 3).map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium">{workout.workout_type}</p>
                      <p className="text-sm text-muted-foreground">{workout.duration_minutes} min • {workout.intensity}</p>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm">{workout.calories_burned} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No workouts logged yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Sleep */}
        <Card className="glass-card rounded-3xl border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="w-5 h-5 text-secondary" />
              Recent Sleep
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent_sleep_logs && data.recent_sleep_logs.length > 0 ? (
              <div className="space-y-3">
                {data.recent_sleep_logs.slice(0, 3).map((sleep, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium">{sleep.duration_hours}h sleep</p>
                      <p className="text-sm text-muted-foreground">{sleep.sleep_time} - {sleep.wake_time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        sleep.quality >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
                        sleep.quality >= 5 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {sleep.quality}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No sleep logs yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
