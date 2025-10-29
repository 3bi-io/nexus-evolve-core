import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export const SelfLearningBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <Badge 
        variant="secondary" 
        className="px-3 py-2 gap-2 bg-primary/10 border-primary/20 backdrop-blur-sm shadow-lg hover:bg-primary/20 transition-colors"
      >
        <Brain className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm font-medium">Oneiros.me</span>
      </Badge>
    </motion.div>
  );
};
