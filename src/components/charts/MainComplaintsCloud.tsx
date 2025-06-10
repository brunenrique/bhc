
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import WordCloud from 'react-d3-cloud';
import { Loader2, AlertTriangle, CloudFog } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyzeComplaintsOutput } from '@/ai/flows/analyze-complaints-flow';

interface MainComplaintsCloudProps {
  complaints: string[]; // List of raw complaint strings
  title?: string;
  className?: string;
}

interface WordData {
  text: string;
  value: number;
}

// Options for react-d3-cloud
const d3CloudColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))", "hsl(var(--accent))"];

const FONT_FAMILY = 'Space Grotesk, sans-serif';
const FONT_WEIGHT = '600';
const PADDING = 2; // Adjusted padding

// Function to map word value to font size
const mapValueToFontSize = (value: number, maxValue: number, minValue: number, minFontSize: number, maxFontSize: number): number => {
  if (maxValue === minValue) return (minFontSize + maxFontSize) / 2; // Avoid division by zero if all values are the same
  const scale = (value - minValue) / (maxValue - minValue);
  return minFontSize + scale * (maxFontSize - minFontSize);
};


export function MainComplaintsCloud({ complaints, title = "Nuvem de Queixas Principais (IA)", className }: MainComplaintsCloudProps) {
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number, height: number }>({ width: 350, height: 350 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const fetchWordCloudData = useCallback(async (currentComplaints: string[]) => {
    if (!currentComplaints || currentComplaints.length === 0) {
      setWords([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ complaints: currentComplaints }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: AnalyzeComplaintsOutput = await response.json();
      setWords(data.themes);
    } catch (err: any) {
      // console.error("Failed to fetch word cloud data:", err);
      setError(err.message || 'Falha ao carregar dados da nuvem de palavras.');
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWordCloudData(complaints);
  }, [complaints, fetchWordCloudData]);

  useEffect(() => {
    // Set container size for the word cloud
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight > 0 ? containerRef.current.offsetHeight : 350, // Default height if offsetHeight is 0
      });
    }
    // Optional: Add resize listener if you want it to be fully responsive
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight > 0 ? containerRef.current.offsetHeight : 350,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const getFontSize = useCallback((word: WordData) => {
    if (words.length === 0) return 10;
    const values = words.map(w => w.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    return mapValueToFontSize(word.value, maxValue, minValue, 18, 60); // Scale between 18px and 60px
  }, [words]);
  
  // Simple rotation logic
  const getRotation = () => (Math.random() > 0.7 ? (Math.random() > 0.5 ? 90: -90) : 0);

  if (isLoading) {
    return (
      <div ref={containerRef} className={`h-[350px] w-full flex flex-col items-center justify-center ${className}`}>
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">Analisando queixas com IA...</p>
        <Skeleton className="w-3/4 h-8 mt-4" />
        <Skeleton className="w-1/2 h-6 mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div ref={containerRef} className={`h-[350px] w-full flex flex-col items-center justify-center text-destructive ${className}`}>
        <AlertTriangle className="h-10 w-10 mb-3" />
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div ref={containerRef} className={`h-[350px] w-full flex flex-col items-center justify-center text-muted-foreground ${className}`}>
        <CloudFog className="h-10 w-10 mb-3" />
        <p className="font-semibold">{title}</p>
        <p className="text-sm">Nenhuma queixa fornecida ou tema identificado.</p>
      </div>
    );
  }
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient || containerSize.width === 0 || containerSize.height === 0) { 
    return (
      <div ref={containerRef} className={`h-[350px] w-full flex flex-col items-center justify-center ${className}`}>
        <Skeleton className="h-full w-full" />
      </div>
    );
  }
  
  // Ensure data is mapped correctly for react-d3-cloud (it expects {text, value})
  const cloudData = words.map(w => ({ text: w.text, value: w.value }));

  return (
    <div ref={containerRef} className={`h-[350px] w-full ${className}`}>
      <WordCloud
        data={cloudData}
        width={containerSize.width || 350}
        height={containerSize.height || 350}
        font={FONT_FAMILY}
        fontWeight={FONT_WEIGHT}
        fontSize={getFontSize}
        rotate={getRotation}
        padding={PADDING}
        spiral="archimedean"
        fill={(word, index) => d3CloudColors[index % d3CloudColors.length]}
        // onWordClick={(event, d) => { console.log(`onWordClick: ${d.text}`); }}
        // onWordMouseOver={(event, d) => { console.log(`onWordMouseOver: ${d.text}`); }}
        // onWordMouseOut={(event, d) => { console.log(`onWordMouseOut: ${d.text}`); }}
      />
    </div>
  );
}

