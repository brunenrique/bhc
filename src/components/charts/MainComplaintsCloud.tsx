
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import WordCloud from 'react-d3-cloud';
import { Loader2, AlertTriangle, CloudFog } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyzeComplaintsOutput } from '@/ai/flows/analyze-complaints-flow';

interface MainComplaintsCloudProps {
  complaints: string[]; 
  title?: string;
  className?: string;
}

interface WordData {
  text: string;
  value: number;
}

const mockWordCloudData: WordData[] = [
  { text: "Ansiedade", value: 75 },
  { text: "Estresse", value: 60 },
  { text: "Sono", value: 50 },
  { text: "Trabalho", value: 45 },
  { text: "Relacionamentos", value: 40 },
  { text: "Motivação", value: 35 },
  { text: "Tristeza", value: 30 },
  { text: "Foco", value: 25 },
  { text: "Pânico", value: 20 },
  { text: "Procrastinação", value: 18 },
  { text: "Autoestima", value: 15 },
  { text: "Solidão", value: 12 },
  { text: "Cansaço", value: 10 },
];

const d3CloudColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))", "hsl(var(--accent))"];
const FONT_FAMILY = 'Space Grotesk, sans-serif';
const FONT_WEIGHT = '600';
const PADDING = 2;

const mapValueToFontSize = (value: number, maxValue: number, minValue: number, minFontSize: number, maxFontSize: number): number => {
  if (maxValue === minValue) return (minFontSize + maxFontSize) / 2;
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
      setWords(mockWordCloudData); // Use mock data if no real complaints
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
      if (data.themes && data.themes.length > 0) {
        setWords(data.themes);
      } else {
        setWords(mockWordCloudData); // Fallback to mock if API returns no themes
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar dados da nuvem de palavras. Exibindo dados de exemplo.');
      setWords(mockWordCloudData); // Fallback to mock on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWordCloudData(complaints);
  }, [complaints, fetchWordCloudData]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight > 0 ? containerRef.current.offsetHeight : 350,
      });
    }
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
    return mapValueToFontSize(word.value, maxValue, minValue, 18, 60);
  }, [words]);
  
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

  if (error && words === mockWordCloudData) { // Show error only if fallback is also due to error
    return (
      <div ref={containerRef} className={`h-[350px] w-full flex flex-col items-center justify-center p-4 text-center ${className}`}>
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <p className="font-semibold text-sm text-destructive">Erro na Análise de Queixas</p>
        <p className="text-xs text-muted-foreground mb-2">{error}</p>
        <p className="text-xs text-muted-foreground">Exibindo nuvem de palavras de exemplo.</p>
        <WordCloud
            data={mockWordCloudData.map(w => ({ text: w.text, value: w.value }))}
            width={Math.max(200, containerSize.width - 20)}
            height={Math.max(200, containerSize.height - 60)}
            font={FONT_FAMILY} fontWeight={FONT_WEIGHT} fontSize={getFontSize}
            rotate={getRotation} padding={PADDING} spiral="archimedean"
            fill={(word, index) => d3CloudColors[index % d3CloudColors.length]}
        />
      </div>
    );
  }
  
  if (words.length === 0 && !error) { // No complaints, no error, but no data from API either
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
      />
    </div>
  );
}
    