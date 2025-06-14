import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import BrightDataConfig from './BrightDataConfig';
import NewsApiConfig from './NewsApiConfig';
import TextSummarizer from './TextSummarizer';
import { Globe, Newspaper, FileText } from 'lucide-react';

interface ConfigTabsProps {
  projectId: string;
}

const ConfigTabs = ({ projectId }: ConfigTabsProps) => {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('brightdata');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="brightdata" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>BrightData</span>
        </TabsTrigger>
        <TabsTrigger value="newsapi" className="flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          <span>NewsAPI</span>
        </TabsTrigger>
        <TabsTrigger value="summarizer" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{isRTL ? 'الملخص' : 'Summarizer'}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="brightdata">
        <BrightDataConfig projectId={projectId} />
      </TabsContent>
      
      <TabsContent value="newsapi">
        <NewsApiConfig projectId={projectId} />
      </TabsContent>
      
      <TabsContent value="summarizer">
        <TextSummarizer />
      </TabsContent>
    </Tabs>
  );
};

export default ConfigTabs;