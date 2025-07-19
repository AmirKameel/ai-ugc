"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTavus } from "@/hooks/use-tavus";
import { TavusReplica, TavusVideo } from "@/lib/tavus";
import { ReplicaSelector } from "./replica-selector";
import { VideoPlayer } from "./video-player";
import { LoadingSpinner } from "./loading-spinner";

interface ProductData {
  name: string;
  description: string;
  images: File[];
}

export function ProductForm() {
  const [step, setStep] = useState<'input' | 'replica' | 'generating' | 'result'>('input');
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    images: [],
  });
  const [selectedReplica, setSelectedReplica] = useState<TavusReplica | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<TavusVideo | null>(null);
  
  const { generateVideo, loading, error } = useTavus();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleProductSubmit = () => {
    if (productData.name && productData.description) {
      setStep('replica');
    }
  };

  const handleReplicaSelect = (replica: TavusReplica) => {
    setSelectedReplica(replica);
  };

  const handleGenerateVideo = async () => {
    if (!selectedReplica) return;
    
    setStep('generating');
    
    try {
      const video = await generateVideo({
        replica_id: selectedReplica.replica_id,
        product_name: productData.name,
        product_description: productData.description,
      });
      
      setGeneratedVideo(video);
      setStep('result');
    } catch (err) {
      console.error('Video generation failed:', err);
      setStep('replica');
    }
  };

  const downloadVideo = async () => {
    if (!generatedVideo?.hosted_url) return;
    
    try {
      const response = await fetch(generatedVideo.hosted_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productData.name}-ugc-video.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const resetForm = () => {
    setStep('input');
    setProductData({ name: '', description: '', images: [] });
    setSelectedReplica(null);
    setGeneratedVideo(null);
  };

  if (step === 'input') {
    return (
      <motion.div
        className="w-full max-w-2xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create Your UGC Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input
                placeholder="Enter your product name..."
                value={productData.name}
                onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Description</label>
              <Textarea
                placeholder="Describe your product, its benefits, and what makes it special..."
                value={productData.description}
                onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Images (Optional)</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload images (max 5)
                  </span>
                </label>
              </div>

              {productData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {productData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleProductSubmit}
              disabled={!productData.name || !productData.description}
              className="w-full"
            >
              Continue to Replica Selection
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'replica') {
    return (
      <motion.div
        className="w-full max-w-4xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Select Your AI Presenter</h2>
            <p className="text-muted-foreground">Choose who will present your product</p>
          </div>
          <Button variant="outline" onClick={() => setStep('input')}>
            Back to Product Details
          </Button>
        </div>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Product: {productData.name}</Badge>
              <Badge variant="outline">{productData.images.length} images uploaded</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {productData.description}
            </p>
          </div>
        </Card>

        <ReplicaSelector
          onSelect={handleReplicaSelect}
          selectedReplica={selectedReplica}
        />

        {selectedReplica && (
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateVideo}
              disabled={loading}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-8 py-3"
            >
              {loading ? 'Generating...' : 'Generate UGC Video'}
            </Button>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm">
            Error: {error}
          </div>
        )}
      </motion.div>
    );
  }

  if (step === 'generating') {
    return (
      <motion.div
        className="w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LoadingSpinner
          title="Creating Your UGC Video"
          subtitle="This may take a few minutes..."
          steps={[
            "Analyzing your product",
            "Generating authentic script",
            "Creating video with AI presenter",
            "Finalizing and processing"
          ]}
        />
      </motion.div>
    );
  }

  if (step === 'result' && generatedVideo) {
    return (
      <motion.div
        className="w-full max-w-4xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Your UGC Video is Ready!</h2>
          <p className="text-muted-foreground">
            Here's your AI-generated user-generated content video
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <VideoPlayer videoUrl={generatedVideo.hosted_url} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={downloadVideo}
                className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(generatedVideo.hosted_url, '_blank')}
              >
                <Play className="w-4 h-4 mr-2" />
                View Full Screen
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <p className="font-medium">{productData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Presenter</label>
                  <p className="font-medium">{selectedReplica?.replica_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant="default" className="bg-green-500">
                    {generatedVideo.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{new Date(generatedVideo.created_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={resetForm}
              className="w-full"
            >
              Create Another Video
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}