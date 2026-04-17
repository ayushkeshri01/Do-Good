"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  slug: string;
}

interface CreatePostFormProps {
  communities: Community[];
}

export function CreatePostForm({ communities }: CreatePostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommunityToggle = (communityId: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId)
        ? prev.filter((id) => id !== communityId)
        : [...prev, communityId]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.slice(0, 4 - images.length);
    setImages((prev) => [...prev, ...newImages].slice(0, 4));

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 4));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || selectedCommunities.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("communities", JSON.stringify(selectedCommunities));
      
      for (const image of images) {
        formData.append("images", image);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/feed");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Share your social work, donation, or volunteer activity..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none"
        />

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Images (optional, max 4)</Label>
          <div className="flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative aspect-square w-20 overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square w-20 items-center justify-center rounded-lg border border-dashed hover:bg-accent"
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Community Selection */}
        <div className="space-y-2">
          <Label>Post to Communities</Label>
          <div className="grid gap-2">
            {communities.map((community) => (
              <div
                key={community.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  selectedCommunities.includes(community.id)
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent"
                )}
                onClick={() => handleCommunityToggle(community.id)}
              >
                <Checkbox
                  checked={selectedCommunities.includes(community.id)}
                  onCheckedChange={() => handleCommunityToggle(community.id)}
                />
                <span className="text-sm">{community.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            You will earn <span className="text-primary font-medium">+50 points</span> for this post
          </p>
          <Button
            onClick={handleSubmit}
            disabled={
              !content.trim() ||
              selectedCommunities.length === 0 ||
              isSubmitting
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
