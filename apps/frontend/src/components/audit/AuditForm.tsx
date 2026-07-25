'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, ShieldCheck, Zap, Globe, Gauge } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url('Please enter a valid URL (e.g., https://example.com)')
});

type FormData = z.infer<typeof formSchema>;

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, trigger, getValues } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });

  const popularSites = ['google.com', 'github.com', 'openai.com', 'stackoverflow.com'];

  const handleBlur = () => {
    let currentUrl = getValues('url');
    if (currentUrl && !/^https?:\/\//i.test(currentUrl)) {
      currentUrl = `https://${currentUrl}`;
      setValue('url', currentUrl);
      trigger('url');
    }
  };

  const handleChipClick = (site: string) => {
    const fullUrl = `https://${site}`;
    setValue('url', fullUrl);
    onSubmit(fullUrl);
  };

  const submitForm = (data: FormData) => {
    onSubmit(data.url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(submitForm)} className="relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <Input
              {...register('url')}
              onBlur={handleBlur}
              disabled={isLoading}
              className="pl-12 h-14 text-lg rounded-xl shadow-sm border-2 focus-visible:ring-0 focus-visible:border-primary transition-all bg-background"
              placeholder="Enter any website URL..."
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Now'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        {errors.url && (
          <p className="text-destructive text-sm mt-2 font-medium">{errors.url.message}</p>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground font-medium">Popular sites:</span>
        {popularSites.map((site) => (
          <button
            key={site}
            onClick={() => handleChipClick(site)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium border shadow-sm"
          >
            {site}
          </button>
        ))}
      </div>

      <div className="pt-6 mt-6 border-t flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Free • No signup</div>
        <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> Under 5 seconds</div>
        <div className="flex items-center gap-1.5"><Gauge className="h-4 w-4 text-blue-500" /> 7 metrics analyzed</div>
      </div>
    </div>
  );
}
