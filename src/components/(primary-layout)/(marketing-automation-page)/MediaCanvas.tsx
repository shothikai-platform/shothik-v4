"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { campaignAPI, mediaAPI } from "@/services/marketing-automation.service";
import type { Ad } from "@/types/campaign";
import {
  ArrowLeft,
  Download,
  Film,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import ImageCanvas from "./canvas/ImageCanvas";
import VideoCanvas from "./canvas/VideoCanvas";

export default function MediaCanvas() {
  const { projectId, adId } = useParams<{ projectId: string; adId: string }>();
  const router = useRouter();

  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedMedia, setGeneratedMedia] = useState<string[]>([]);

  // Debug wrapper for setGeneratedMedia
  const handleMediaUploaded = (mediaUrls: string[]) => {
    console.log("MediaCanvas: setGeneratedMedia called with:", mediaUrls);
    console.log(
      "MediaCanvas: Current generatedMedia before update:",
      generatedMedia,
    );
    setGeneratedMedia(mediaUrls);
    console.log("MediaCanvas: setGeneratedMedia called successfully");
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"generate" | "edit">("generate");

  // Load ad data
  useEffect(() => {
    const loadAdData = async () => {
      if (!projectId || !adId) return;

      try {
        setIsLoading(true);
        const response = await campaignAPI.getCampaignData(projectId);
        const foundAd = response.data.ads.find((a: Ad) => a.id === adId);

        if (foundAd) {
          setAd(foundAd);

          // Load existing media if available
          if (foundAd.imageUrls && foundAd.imageUrls.length > 0) {
            // Carousel with multiple images
            setGeneratedMedia(foundAd.imageUrls);
            console.log(
              `Loaded ${foundAd.imageUrls.length} carousel images from database`,
            );
          } else if (foundAd.imageUrl) {
            // Single image
            setGeneratedMedia([foundAd.imageUrl]);
            console.log("Loaded single image from database");
          } else if (foundAd.videoUrl) {
            // Video
            setGeneratedMedia([foundAd.videoUrl]);
            console.log("Loaded video from database");
          }
        } else {
          console.error("Ad not found");
          router.push(`/marketing-automation/canvas/${projectId}`);
        }
      } catch (error) {
        console.error("Error loading ad:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdData();
  }, [projectId, adId]);

  const isVideoFormat =
    ad?.format === "VIDEO" ||
    ad?.format === "SHORT_VIDEO" ||
    ad?.format === "LONG_VIDEO";

  const handleGenerateMedia = async () => {
    if (!projectId || !adId) return;

    setIsGenerating(true);

    try {
      const result = await mediaAPI.generateMedia(projectId, adId);

      if (result.success) {
        // Handle carousel with multiple images
        if (result.mediaUrls && result.mediaUrls.length > 0) {
          setGeneratedMedia(result.mediaUrls);
          console.log(`Generated ${result.mediaUrls.length} carousel images`);
        } else if (result.mediaUrl) {
          // Single image/video
          setGeneratedMedia([result.mediaUrl]);
        } else {
          console.error("Media generation failed: No media URLs returned");
          // Fallback to placeholder for development
          setGeneratedMedia([
            "https://v3.fal.media/files/monkey/U_ff2CG_OehqYE2YTsAHJ.jpeg",
          ]);
        }
      } else {
        console.error("Media generation failed:", result.error);
        // Fallback to placeholder for development
        setGeneratedMedia([
          "https://v3.fal.media/files/monkey/U_ff2CG_OehqYE2YTsAHJ.jpeg",
        ]);
      }
    } catch (error) {
      console.error("Media generation error:", error);
      // Fallback to placeholder
      setGeneratedMedia([
        "https://v3.fal.media/files/monkey/U_ff2CG_OehqYE2YTsAHJ.jpeg",
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditMedia = async (
    regions: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      imageIndex: number;
    }>,
  ) => {
    if (
      !editPrompt.trim() ||
      generatedMedia.length === 0 ||
      !projectId ||
      !adId
    )
      return;

    setIsGenerating(true);

    try {
      // Convert regions to simpler format for API
      const selectedRegions = regions.map((r) => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      }));

      const result = await mediaAPI.regenerateMedia(
        projectId,
        adId,
        editPrompt,
        selectedRegions.length > 0 ? selectedRegions : undefined,
      );

      if (result.success && result.mediaUrl) {
        setGeneratedMedia([result.mediaUrl]);
        setEditPrompt("");
      } else {
        console.error("Media regeneration failed:", result.error);
      }
    } catch (error) {
      console.error("Media regeneration error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedMedia.length === 0) return;

    // TODO: Implement actual download
    // For now, download the first image/video
    const link = document.createElement("a");
    link.href = generatedMedia[0];
    link.download = `${ad?.headline}-media.${isVideoFormat ? "mp4" : "png"}`;
    link.click();
  };

  const handleSaveAndApply = async () => {
    if (generatedMedia.length === 0 || !projectId || !adId) return;

    try {
      // TODO: Implement save to ad
      console.log("Saving media to ad:", adId);
      router.push(`/marketing-automation/canvas/${projectId}`);
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-foreground text-lg">Loading ad data...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4 text-lg">Ad not found</p>
          <Link href={`/marketing-automation/canvas/${projectId}`}>
            <Button>Back to Canvas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="border-border bg-background/90 sticky top-0 z-10 h-12 border-b backdrop-blur-lg md:h-16">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href={`/marketing-automation/canvas/${projectId}`}>
              <Button
                variant="ghost"
                size="icon"
                title="Back to Campaign"
              >
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Wand2 className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground text-xl font-bold">
                  AI Media Canvas
                </h1>
                <p className="text-muted-foreground text-xs">
                  {ad.headline} • {ad.format}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {generatedMedia.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button onClick={handleSaveAndApply} className="shadow-lg">
                  Save & Apply
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Controls */}
          <div className="space-y-6 lg:col-span-1">
            {/* Generate Button */}
            <Button
              onClick={handleGenerateMedia}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate
                </>
              )}
            </Button>

            {/* Prompt Input */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Film className="text-primary h-4 w-4" />
                <CardTitle className="text-base font-semibold">
                  Creative Direction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={ad.creative_direction || ""}
                  readOnly
                  rows={4}
                  className="resize-none"
                  placeholder="No creative direction provided"
                />
              </CardContent>
            </Card>

            {/* Ad Details */}
            <Card>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-xs font-medium">
                    Format:
                  </span>
                  <p className="text-foreground font-semibold">{ad.format}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium">
                    Hook:
                  </span>
                  <p className="text-muted-foreground text-sm">{ad.hook}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium">
                    Persona:
                  </span>
                  <p className="text-muted-foreground text-sm">
                    {ad.persona || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium">
                    Awareness Stage:
                  </span>
                  <p className="text-muted-foreground text-sm capitalize">
                    {ad.awareness_stage?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Image Button */}
            <Button
              onClick={handleGenerateMedia}
              disabled={isGenerating}
              variant="secondary"
              className="flex w-full items-center justify-center gap-2 font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate {isVideoFormat ? "Video" : "Image"}
                </>
              )}
            </Button>

            {/* AI Generation Info */}
            <Card className="border-primary/30 bg-primary/10">
              <CardHeader>
                <CardTitle className="text-primary text-sm font-semibold">
                  AI Generation Info
                </CardTitle>
                <CardDescription>
                  Key context used to personalize this media.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Uses creative direction as context</li>
                  <li>• Optimized for {ad.format} format</li>
                  <li>• Matches persona: {ad.persona}</li>
                  <li>• Awareness: {ad.awareness_stage}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas Area */}
          <div className="space-y-6 lg:col-span-3">
            {/* Use separate components for image and video */}
            {isVideoFormat ? (
              <VideoCanvas
                format={ad.format}
                headline={ad.headline}
                generatedMedia={generatedMedia}
                isGenerating={isGenerating}
                onGenerate={handleGenerateMedia}
                onRegenerate={handleGenerateMedia}
                onDownload={handleDownload}
                projectId={projectId || ""}
                adId={adId || ""}
                onMediaUploaded={handleMediaUploaded}
              />
            ) : (
              <ImageCanvas
                format={ad.format}
                generatedMedia={generatedMedia}
                isGenerating={isGenerating}
                editPrompt={editPrompt}
                setEditPrompt={setEditPrompt}
                onGenerate={handleGenerateMedia}
                onEdit={handleEditMedia}
                onRegenerate={handleGenerateMedia}
                onDownload={handleDownload}
                projectId={projectId || ""}
                adId={adId || ""}
                onMediaUploaded={setGeneratedMedia}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
