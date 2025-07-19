"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TavusReplica } from "@/lib/tavus";
import { useTavus } from "@/hooks/use-tavus";
import { cn } from "@/lib/utils";

interface ReplicaSelectorProps {
  onSelect: (replica: TavusReplica) => void;
  selectedReplica: TavusReplica | null;
}

export function ReplicaSelector({ onSelect, selectedReplica }: ReplicaSelectorProps) {
  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchReplicas, error } = useTavus();

  useEffect(() => {
    const loadReplicas = async () => {
      try {
        const data = await fetchReplicas();
        // Filter only ready replicas
        const readyReplicas = data.filter(replica => replica.status === 'ready');
        setReplicas(readyReplicas);
      } catch (err) {
        console.error('Failed to load replicas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReplicas();
  }, [fetchReplicas]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Available AI Presenters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load AI presenters: {error}</p>
      </div>
    );
  }

  if (replicas.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <User className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <h3 className="text-lg font-medium">No AI Presenters Available</h3>
          <p className="text-muted-foreground">
            You need to create and train AI replicas first using the Tavus platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Your AI Presenter</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {replicas.map((replica, index) => (
          <motion.div
            key={replica.replica_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedReplica?.replica_id === replica.replica_id &&
                "ring-2 ring-fuchsia-500 shadow-lg"
              )}
              onClick={() => onSelect(replica)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                      <User className="h-12 w-12 text-fuchsia-500" />
                    </div>
                    {selectedReplica?.replica_id === replica.replica_id && (
                      <div className="absolute -top-2 -right-2 bg-fuchsia-500 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium truncate">{replica.replica_name}</h4>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={replica.status === 'ready' ? 'default' : 'secondary'}
                        className={replica.status === 'ready' ? 'bg-green-500' : ''}
                      >
                        {replica.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(replica.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}